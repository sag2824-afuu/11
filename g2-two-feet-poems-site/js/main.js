/* =========================================================
   第二組「兩腳詩集」互動元件
   每個元件都會先檢查頁面上有沒有對應的區塊，沒有就跳過，
   所以所有頁面可以共用這一個檔案。
   ========================================================= */

/* 小工具：安全地讀寫瀏覽器儲存（有些瀏覽器不允許時就略過） */
function loadList(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; }
}
function saveList(key, list) {
  try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) { /* 無法儲存時只顯示在畫面上 */ }
}

/* ---------- 1. 慢行路線：點站點展開說明（展區一）---------- */
document.querySelectorAll('.route-stop').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var detail = document.getElementById(btn.getAttribute('aria-controls'));
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    detail.hidden = open;
  });
});

/* ---------- 2. 走一走，算一算（展區一）---------- */
/* 教學估算：每公里約 1,300 步、步行每公里約 15 分鐘 */
var STEPS_PER_KM = 1300;
var MIN_PER_KM = 15;
var walkForm = document.getElementById('walk-form');
if (walkForm) {
  var kmInput = document.getElementById('walk-km');
  var timesInput = document.getElementById('walk-times');
  function updateWalk() {
    var km = Math.max(0, parseFloat(kmInput.value) || 0);
    var times = Math.max(0, parseInt(timesInput.value, 10) || 0);
    var steps = Math.round(km * STEPS_PER_KM);
    var mins = Math.round(km * MIN_PER_KM);
    var weekly = mins * times;
    document.getElementById('out-steps').textContent = steps.toLocaleString('zh-TW');
    document.getElementById('out-mins').textContent = mins;
    document.getElementById('out-week').textContent = weekly;
    var pct = Math.min(100, Math.round(weekly / 150 * 100));
    document.getElementById('meter-bar').style.width = pct + '%';
    document.getElementById('walk-msg').textContent = weekly >= 150
      ? '太棒了！一週走路 ' + weekly + ' 分鐘，已經達到每週 150 分鐘的建議。'
      : '一週走路 ' + weekly + ' 分鐘，離每週 150 分鐘還差 ' + (150 - weekly) + ' 分鐘。';
  }
  kmInput.addEventListener('input', updateWalk);
  timesInput.addEventListener('input', updateWalk);
  updateWalk();
}

/* ---------- 3. 老鐵馬零件熱點圖（展區二）---------- */
var bike = document.querySelector('.bike-wrap');
if (bike) {
  var partBtns = bike.querySelectorAll('.part-btn');
  var hotspots = bike.querySelectorAll('.hotspot');
  function showPart(id) {
    var src = document.getElementById('part-' + id);
    document.getElementById('part-title').textContent = src.dataset.name;
    document.getElementById('part-old').textContent = src.dataset.old;
    document.getElementById('part-now').textContent = src.dataset.now;
    partBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.part === id ? 'true' : 'false'); });
    hotspots.forEach(function (h) { h.classList.toggle('is-active', h.dataset.part === id); });
  }
  partBtns.forEach(function (b) { b.addEventListener('click', function () { showPart(b.dataset.part); }); });
  hotspots.forEach(function (h) {
    h.addEventListener('click', function () { showPart(h.dataset.part); });
    h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showPart(h.dataset.part); } });
  });
  showPart(partBtns[0].dataset.part);
}

/* ---------- 4. 記憶分享牆（展區二）---------- */
/* 注意：留言只存在「這台電腦的這個瀏覽器」。要讓大家共享，請改用 Google 表單嵌入。 */
var memForm = document.getElementById('memory-form');
if (memForm) {
  var MEM_KEY = 'g2-memories';
  var memWall = document.getElementById('memory-wall');
  var memSamples = [
    { name: '策展小組', text: '外公的黑色鐵馬後座有一塊鐵板，小時候我就坐在上面去市場。' },
    { name: '示範留言', text: '第一次學騎車，是爸爸在後面扶著，放手了我都不知道。' }
  ];
  var memories = loadList(MEM_KEY);
  function renderMem() {
    memWall.innerHTML = '';
    memories.concat(memSamples).forEach(function (m) {
      var li = document.createElement('li');
      li.className = 'memory';
      var b = document.createElement('b');
      b.textContent = m.name;
      li.appendChild(b);
      li.appendChild(document.createTextNode(m.text));
      memWall.appendChild(li);
    });
  }
  memForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = document.getElementById('memory-text').value.trim();
    var name = document.getElementById('memory-name').value.trim() || '一位朋友';
    var msg = document.getElementById('memory-msg');
    if (!text) { msg.textContent = '請先寫下一句您的鐵馬記憶喔！'; return; }
    memories.unshift({ name: name.slice(0, 20), text: text.slice(0, 120) });
    saveList(MEM_KEY, memories);
    renderMem();
    memForm.reset();
    msg.textContent = '謝謝您的分享！';
  });
  renderMem();
}

/* ---------- 5. 腳印承諾卡（展區三）---------- */
function footSVG(color) {
  return '<svg viewBox="0 0 40 60" aria-hidden="true"><ellipse cx="20" cy="38" rx="11" ry="17" fill="' + color + '"/>' +
    '<circle cx="9" cy="14" r="4" fill="' + color + '"/><circle cx="17" cy="9" r="4.5" fill="' + color + '"/>' +
    '<circle cx="26" cy="9" r="4" fill="' + color + '"/><circle cx="33" cy="14" r="3.5" fill="' + color + '"/></svg>';
}
var footForm = document.getElementById('foot-form');
if (footForm) {
  var FOOT_KEY = 'g2-footprints';
  var footWall = document.getElementById('foot-wall');
  var preview = document.getElementById('preview');
  var color = '#2f5d3a';
  var footSamples = [
    { name: '策展小組', text: '下次來集集，我搭火車再騎腳踏車', color: '#2f5d3a' },
    { name: '示範腳印', text: '短程 1 公里內，我用走的', color: '#7a5a3a' }
  ];
  var prints = loadList(FOOT_KEY);
  document.querySelectorAll('.color-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      color = b.dataset.color;
      document.querySelectorAll('.color-btn').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    });
  });
  function card(p) {
    var li = document.createElement('li');
    li.className = 'foot-card';
    li.innerHTML = footSVG(p.color);
    var div = document.createElement('div');
    var b = document.createElement('b');
    b.textContent = p.name + ' 的綠色腳印';
    div.appendChild(b);
    div.appendChild(document.createTextNode(p.text));
    li.appendChild(div);
    return li;
  }
  function renderFoot() {
    footWall.innerHTML = '';
    prints.concat(footSamples).forEach(function (p) { footWall.appendChild(card(p)); });
  }
  footForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var choice = footForm.querySelector('input[name="pledge"]:checked');
    var name = document.getElementById('foot-name').value.trim() || '一位朋友';
    var msg = document.getElementById('foot-msg');
    if (!choice) { msg.textContent = '請先選一個承諾喔！'; return; }
    var p = { name: name.slice(0, 20), text: choice.value, color: color };
    prints.unshift(p);
    saveList(FOOT_KEY, prints);
    renderFoot();
    preview.innerHTML = '';
    preview.appendChild(card(p));
    document.getElementById('print-btn').hidden = false;
    msg.textContent = '腳印蓋好了！它也出現在下面的足跡牆上。';
  });
  document.getElementById('print-btn').addEventListener('click', function () { window.print(); });
  renderFoot();
}

/* ---------- 6. 同一段路，不同的足跡（展區三）---------- */
/* 係數單位：公克 CO2e／每人每公里。機車、汽車為教學估算值。 */
var FACTORS = [
  { mode: '步行', g: 0 },
  { mode: '腳踏車', g: 0 },
  { mode: '臺鐵區間車', g: 55 },
  { mode: '機車（估算）', g: 78 },
  { mode: '汽車單人（估算）', g: 150 }
];
var compare = document.getElementById('compare');
if (compare) {
  var cmpKm = document.getElementById('cmp-km');
  function updateCmp() {
    var km = Math.max(0, parseFloat(cmpKm.value) || 0);
    var max = 150 * km || 1;
    compare.innerHTML = '';
    FACTORS.forEach(function (f) {
      var total = f.g * km;
      var row = document.createElement('div');
      row.className = 'bar-row' + (f.g === 0 ? ' zero' : '');
      row.innerHTML = '<span>' + f.mode + '</span><div class="bar"><span style="width:' + (total / max * 100) + '%"></span></div>' +
        '<span>' + (f.g === 0 ? '0 g 🌱' : (total >= 1000 ? (total / 1000).toFixed(2) + ' kg' : Math.round(total) + ' g')) + '</span>';
      compare.appendChild(row);
    });
  }
  cmpKm.addEventListener('input', updateCmp);
  updateCmp();
}
