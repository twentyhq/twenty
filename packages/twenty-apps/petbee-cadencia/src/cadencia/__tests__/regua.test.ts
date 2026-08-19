import assert from 'node:assert/strict';
import { test } from 'node:test';

import { horarioSP, proximas, tardeDoDia, zapDe } from '../regua.ts';

// 2026-08-19 10:00 em São Paulo (13:00 UTC).
const MANHA_SP = new Date('2026-08-19T13:00:00.000Z');
// 2026-08-19 17:00 em São Paulo (20:00 UTC).
const FIM_DE_TARDE_SP = new Date('2026-08-19T20:00:00.000Z');

test('FUP 1 vence no instante da qualificação', () => {
  const [toque] = proximas('Luc Test', 0, MANHA_SP);

  assert.equal(toque.titulo, 'FUP 1 (abordar agora) — Luc Test');
  assert.equal(toque.dueAt, MANHA_SP.toISOString());
});

test('FUP 2 vence 1h30 depois da conclusão da FUP 1', () => {
  const [toque] = proximas('Luc Test', 1, MANHA_SP);

  assert.equal(toque.titulo, 'FUP 2 (mensagem, ~1h30 depois) — Luc Test');
  assert.equal(toque.dueAt, '2026-08-19T14:30:00.000Z');
});

test('FUP 3 vence na manhã seguinte às 9h30 de São Paulo', () => {
  const [toque] = proximas('Luc Test', 2, MANHA_SP);

  assert.equal(toque.dueAt, '2026-08-20T12:30:00.000Z');
});

test('FUP 4 concluída de manhã vence hoje às 16h de São Paulo', () => {
  const [toque] = proximas('Luc Test', 3, MANHA_SP);

  assert.equal(toque.dueAt, '2026-08-19T19:00:00.000Z');
});

test('FUP 4 concluída após as 16h empurra para amanhã às 16h', () => {
  assert.equal(tardeDoDia(FIM_DE_TARDE_SP), '2026-08-20T19:00:00.000Z');
});

test('FUP 8 vence no dia seguinte às 16h; FUP 9 na manhã seguinte', () => {
  assert.equal(proximas('X', 7, MANHA_SP)[0].dueAt, '2026-08-20T19:00:00.000Z');
  assert.equal(proximas('X', 8, MANHA_SP)[0].dueAt, '2026-08-20T12:30:00.000Z');
});

test('depois da FUP 9 a régua não agenda mais toques', () => {
  assert.deepEqual(proximas('X', 9, MANHA_SP), []);
  assert.deepEqual(proximas('X', 12, MANHA_SP), []);
});

test('virada de mês: manhã seguinte de 31/08 é 01/09', () => {
  const fimDeMes = new Date('2026-08-31T13:00:00.000Z');

  assert.equal(horarioSP(fimDeMes, 1, 9, 30), '2026-09-01T12:30:00.000Z');
});

test('FUP final do Break cai 25 dias depois às 11h de São Paulo', () => {
  assert.equal(horarioSP(MANHA_SP, 25, 11, 0), '2026-09-13T14:00:00.000Z');
});

test('zapDe aceita número real e rejeita vazio ou lixo', () => {
  const zap = zapDe('+55 41 99999-8888');

  assert.ok(zap);
  assert.equal(zap.label, '+55 41 99999-8888');
  assert.equal(zap.url, 'https://inbox.petbeetools.com.br/');
  assert.ok(zap.markdown.includes('abrir inbox'));
  assert.equal(zapDe(''), null);
  assert.equal(zapDe('abc'), null);
  assert.equal(zapDe(null), null);
});
