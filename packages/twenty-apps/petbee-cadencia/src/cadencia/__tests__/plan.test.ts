import assert from 'node:assert/strict';
import { test } from 'node:test';

import { computePlan, type OppDoFunil, type PlanInput, type PlanOp } from '../plan.ts';

const AGORA = new Date('2026-08-19T13:00:00.000Z');

function entrada(parcial: Partial<PlanInput>): PlanInput {
  return {
    agora: AGORA,
    funil: [],
    abertas: [],
    perdidasSemMotivo: [],
    foraDoFunil: {},
    ...parcial,
  };
}

function oppDe(parcial: Partial<OppDoFunil>): OppDoFunil {
  return {
    id: 'opp-1',
    name: 'Luc Test',
    stage: 'EM_NEGOCIACAO',
    fupNumero: 0,
    whatsapp: '+55 41 99999-8888',
    tarefas: [],
    ...parcial,
  };
}

function criacoes(ops: PlanOp[]): Extract<PlanOp, { kind: 'createTask' }>[] {
  return ops.filter((op): op is Extract<PlanOp, { kind: 'createTask' }> => op.kind === 'createTask');
}

test('negócio novo em Em Negociação ganha a FUP 1 imediata, da Vitória, com zap', () => {
  const ops = computePlan(entrada({ funil: [oppDe({})] }));
  const criadas = criacoes(ops);

  assert.equal(criadas.length, 1);
  assert.equal(criadas[0].data.title, 'FUP 1 (abordar agora) — Luc Test');
  assert.equal(criadas[0].data.dueAt, AGORA.toISOString());
  assert.equal(criadas[0].data.assigneeId, '69572821-c2f4-4923-9c68-23381b665a49');
  assert.equal(criadas[0].data.whatsapp?.primaryLinkUrl, 'https://inbox.petbeetools.com.br/');
});

test('FUP 9 concluída sem mover o card cobra a decisão (guarda pós-régua)', () => {
  const opp = oppDe({
    fupNumero: 8,
    tarefas: [{ id: 't9', title: 'FUP 9 (mensagem, manhã) — Luc Test', status: 'DONE' }],
  });
  const ops = computePlan(entrada({ funil: [opp] }));

  assert.ok(
    ops.find(
      (op) => op.kind === 'updateOpportunity' && op.data.fupNumero === 9,
    ),
    'fupNumero deve sincronizar para 9',
  );

  const criadas = criacoes(ops);

  assert.equal(criadas.length, 1);
  assert.equal(criadas[0].data.title, 'Decidir: Break ou Perdido? — Luc Test');
  assert.ok(criadas[0].data.bodyV2?.markdown.includes('9 toques feitos'));
});

test('decisão concluída sem mover o card é recriada (guarda insiste)', () => {
  const opp = oppDe({
    fupNumero: 9,
    tarefas: [
      { id: 'td', title: 'Decidir: Break ou Perdido? — Luc Test', status: 'DONE' },
    ],
  });
  const criadas = criacoes(computePlan(entrada({ funil: [opp] })));

  assert.equal(criadas.length, 1);
  assert.equal(criadas[0].data.title, 'Decidir: Break ou Perdido? — Luc Test');
});

test('mover pro Break apaga decisão e FUPs abertas e agenda a FUP final (+25d, 11h SP)', () => {
  const opp = oppDe({
    stage: 'BREAK',
    fupNumero: 9,
    tarefas: [
      { id: 'td', title: 'Decidir: Break ou Perdido? — Luc Test', status: 'TODO' },
      { id: 't9', title: 'FUP 9 (mensagem, manhã) — Luc Test', status: 'TODO' },
    ],
  });
  const ops = computePlan(entrada({ funil: [opp] }));

  assert.deepEqual(
    ops.filter((op) => op.kind === 'deleteTask').map((op) => op.taskId).sort(),
    ['t9', 'td'],
  );

  const criadas = criacoes(ops);

  assert.equal(criadas.length, 1);
  assert.equal(criadas[0].data.title, 'FUP final (antes do lost) — Luc Test');
  assert.equal(criadas[0].data.dueAt, '2026-09-13T14:00:00.000Z');
});

test('duplicata aberta da mesma FUP (corrida) é removida', () => {
  const opp = oppDe({
    tarefas: [
      { id: 'a', title: 'FUP 1 (abordar agora) — Luc Test', status: 'TODO' },
      { id: 'b', title: 'FUP 1 (abordar agora) — Luc Test', status: 'TODO' },
    ],
  });
  const ops = computePlan(entrada({ funil: [opp] }));

  assert.deepEqual(
    ops.filter((op) => op.kind === 'deleteTask').map((op) => op.taskId),
    ['b'],
  );
  assert.equal(criacoes(ops).length, 0);
});

test('task manual (título fora dos padrões) nunca é tocada', () => {
  const opp = oppDe({
    fupNumero: 1,
    tarefas: [
      { id: 'm', title: 'Ligar pro veterinário parceiro', status: 'TODO' },
      { id: 't2', title: 'FUP 2 (mensagem, ~1h30 depois) — Luc Test', status: 'TODO' },
    ],
  });
  const ops = computePlan(entrada({ funil: [opp] }));

  assert.ok(!ops.find((op) => op.kind === 'deleteTask' && op.taskId === 'm'));
  assert.ok(!ops.find((op) => op.kind === 'updateTask' && op.taskId === 'm'));
});

test('vencimento editado à mão é respeitado (sem updateTask de dueAt)', () => {
  const opp = oppDe({
    fupNumero: 1,
    tarefas: [
      {
        id: 't2',
        title: 'FUP 2 (mensagem, ~1h30 depois) — Luc Test',
        status: 'TODO',
        dueAt: '2026-08-25T12:00:00.000Z',
        whatsapp: { primaryLinkUrl: 'https://inbox.petbeetools.com.br/' },
      },
    ],
  });
  const ops = computePlan(entrada({ funil: [opp] }));

  assert.deepEqual(ops, []);
});

test('link wa.me antigo ganha self-heal para o inbox', () => {
  const opp = oppDe({
    fupNumero: 1,
    tarefas: [
      {
        id: 't2',
        title: 'FUP 2 (mensagem, ~1h30 depois) — Luc Test',
        status: 'TODO',
        whatsapp: { primaryLinkUrl: 'https://wa.me/5541999998888' },
      },
    ],
  });
  const ops = computePlan(entrada({ funil: [opp] }));

  assert.equal(ops.length, 1);
  assert.equal(ops[0].kind, 'updateTask');
});

test('task gerenciada de negócio que saiu do funil (Ganhou/Perdido) é apagada', () => {
  const ops = computePlan(
    entrada({
      abertas: [
        { id: 'x', title: 'FUP 3 (ligação + mensagem, manhã) — Fulano', targetOpportunityId: 'opp-won' },
        { id: 'y', title: 'Decidir: Break ou Perdido? — Fulano', targetOpportunityId: 'opp-won' },
        { id: 'z', title: 'Task manual solta', targetOpportunityId: 'opp-won' },
      ],
      foraDoFunil: { 'opp-won': { id: 'opp-won', stage: 'WON' } },
    }),
  );

  assert.deepEqual(
    ops.filter((op) => op.kind === 'deleteTask').map((op) => op.taskId).sort(),
    ['x', 'y'],
  );
});

test('Perdido sem motivo ganha a guarda; com motivo preenchido a guarda cai', () => {
  const criando = computePlan(
    entrada({ perdidasSemMotivo: [{ id: 'opp-lost', name: 'Fulano' }] }),
  );
  const criadas = criacoes(criando);

  assert.equal(criadas.length, 1);
  assert.equal(criadas[0].data.title, 'Preencher motivo da perda — Fulano');

  const limpando = computePlan(
    entrada({
      abertas: [
        { id: 'g', title: 'Preencher motivo da perda — Fulano', targetOpportunityId: 'opp-lost' },
      ],
      foraDoFunil: {
        'opp-lost': { id: 'opp-lost', stage: 'LOST', motivoLost: 'SEM_ORCAMENTO' },
      },
    }),
  );

  assert.deepEqual(
    limpando.filter((op) => op.kind === 'deleteTask').map((op) => op.taskId),
    ['g'],
  );
});

test('concluir várias FUPs de uma vez agenda só a próxima certa', () => {
  const opp = oppDe({
    fupNumero: 0,
    tarefas: [
      { id: 't1', title: 'FUP 1 (abordar agora) — Luc Test', status: 'DONE' },
      { id: 't2', title: 'FUP 2 (mensagem, ~1h30 depois) — Luc Test', status: 'DONE' },
      { id: 't3', title: 'FUP 3 (ligação + mensagem, manhã) — Luc Test', status: 'DONE' },
    ],
  });
  const ops = computePlan(entrada({ funil: [opp] }));
  const criadas = criacoes(ops);

  assert.equal(criadas.length, 1);
  assert.ok(criadas[0].data.title.startsWith('FUP 4 '));
  assert.ok(
    ops.find((op) => op.kind === 'updateOpportunity' && op.data.fupNumero === 3),
  );
});
