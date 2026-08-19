// Reconciliação de estado desejado — porte fiel do nó "Plano de cadência" (n8n v10).
// Entrada: fotografia do funil vivo + tasks abertas. Saída: lista de operações que
// tornam o CRM igual ao estado desejado. Função PURA: nada de rede ou relógio próprio.
import {
  markdownDecisao,
  PADRAO_DECISAO,
  PADRAO_FUP,
  PADRAO_MOTIVO,
  proximas,
  tituloDecisaoDe,
  tituloFinalDe,
  tituloMotivoDe,
  horarioSP,
  VITORIA_WORKSPACE_MEMBER_ID,
  zapDe,
  type Zap,
} from './regua.ts';

export type TaskDoFunil = {
  id: string;
  title: string;
  status: string;
  dueAt?: string | null;
  whatsapp?: { primaryLinkUrl?: string | null } | null;
};

export type OppDoFunil = {
  id: string;
  name: string;
  stage: string;
  fupNumero?: number | null;
  whatsapp?: string | null;
  tarefas: TaskDoFunil[];
};

export type TaskAberta = {
  id: string;
  title: string;
  targetOpportunityId: string | null;
};

export type OppForaDoFunil = {
  id: string;
  stage: string;
  motivoLost?: string | null;
};

export type PlanInput = {
  agora: Date;
  funil: OppDoFunil[];
  abertas: TaskAberta[];
  perdidasSemMotivo: { id: string; name: string }[];
  // Negócios (fora do funil vivo) que são alvo de alguma task gerenciada aberta, por id.
  foraDoFunil: Record<string, OppForaDoFunil>;
};

export type TaskCreateData = {
  title: string;
  status: 'TODO';
  dueAt: string;
  assigneeId: string;
  whatsapp?: { primaryLinkLabel: string; primaryLinkUrl: string };
  bodyV2?: { markdown: string };
};

export type PlanOp =
  | { kind: 'createTask'; oppId: string; data: TaskCreateData }
  | { kind: 'updateTask'; taskId: string; data: Record<string, unknown> }
  | { kind: 'deleteTask'; taskId: string }
  | { kind: 'updateOpportunity'; oppId: string; data: { fupNumero: number } };

function camposZap(zap: Zap): {
  whatsapp: { primaryLinkLabel: string; primaryLinkUrl: string };
  bodyV2: { markdown: string };
} {
  return {
    whatsapp: { primaryLinkLabel: zap.label, primaryLinkUrl: zap.url },
    bodyV2: { markdown: zap.markdown },
  };
}

function opCreate(
  oppId: string,
  titulo: string,
  dueAt: string,
  zap: Zap | null,
  markdown?: string,
): PlanOp {
  const data: TaskCreateData = {
    title: titulo,
    status: 'TODO',
    dueAt,
    assigneeId: VITORIA_WORKSPACE_MEMBER_ID,
  };

  if (zap) Object.assign(data, camposZap(zap));
  if (markdown) data.bodyV2 = { markdown };

  return { kind: 'createTask', oppId, data };
}

function numDe(titulo: string): number | null {
  const m = titulo.match(/^FUP (\d+) /);

  return m ? parseInt(m[1], 10) : null;
}

function linkDesatualizado(task: TaskDoFunil): boolean {
  const url = task.whatsapp?.primaryLinkUrl;

  return !url || url.indexOf('wa.me') !== -1;
}

export function computePlan(input: PlanInput): PlanOp[] {
  const { agora, funil, abertas, perdidasSemMotivo, foraDoFunil } = input;
  const ops: PlanOp[] = [];

  for (const opp of funil) {
    // Dedup anti-corrida: segunda task gerenciada ABERTA com mesmo título é excluída.
    const vistos: Record<string, boolean> = {};
    const tarefas: TaskDoFunil[] = [];

    for (const t of opp.tarefas) {
      const gerenciadaAberta =
        t.status !== 'DONE' &&
        (PADRAO_FUP.test(t.title) || PADRAO_DECISAO.test(t.title));

      if (gerenciadaAberta && vistos[t.title]) {
        ops.push({ kind: 'deleteTask', taskId: t.id });
        continue;
      }
      if (gerenciadaAberta) vistos[t.title] = true;
      tarefas.push(t);
    }

    const feitos = tarefas
      .filter((t) => t.status === 'DONE')
      .map((t) => numDe(t.title))
      .filter((n): n is number => n != null);
    const maxFeito = feitos.length ? Math.max(...feitos) : 0;
    const zap = zapDe(opp.whatsapp);

    if (opp.stage === 'EM_NEGOCIACAO') {
      const fupCampo = opp.fupNumero == null ? 0 : opp.fupNumero;
      const fupReal = Math.max(fupCampo, maxFeito);

      // fupNumero acompanha o maior FUP realmente concluído (teto 9).
      if (fupCampo !== Math.min(fupReal, 9)) {
        ops.push({
          kind: 'updateOpportunity',
          oppId: opp.id,
          data: { fupNumero: Math.min(fupReal, 9) },
        });
      }

      const esperadas = proximas(opp.name, fupReal, agora);
      const titulosEsperados = new Set(esperadas.map((e) => e.titulo));

      // FUP aberta que não é a esperada: nº já alcançado vira DONE, futura órfã é excluída.
      for (const t of tarefas) {
        if (
          t.status === 'DONE' ||
          !PADRAO_FUP.test(t.title) ||
          titulosEsperados.has(t.title)
        )
          continue;

        const n = numDe(t.title);

        if (n != null && n <= fupReal) {
          ops.push({ kind: 'updateTask', taskId: t.id, data: { status: 'DONE' } });
        } else {
          ops.push({ kind: 'deleteTask', taskId: t.id });
        }
      }

      // Esperada faltando é criada; aberta existente só ganha self-heal do link
      // (vazio ou wa.me) — vencimento editado à mão é respeitado.
      for (const esperada of esperadas) {
        const jaTem = tarefas.find((t) => t.title === esperada.titulo);

        if (!jaTem) {
          ops.push(opCreate(opp.id, esperada.titulo, esperada.dueAt, zap));
        } else if (jaTem.status !== 'DONE' && zap && linkDesatualizado(jaTem)) {
          ops.push({ kind: 'updateTask', taskId: jaTem.id, data: camposZap(zap) });
        }
      }

      // Guarda pós-FUP 9: card parado em Em Negociação cobra a decisão até mover.
      const tituloDecisao = tituloDecisaoDe(opp.name);

      for (const t of tarefas) {
        if (t.status === 'DONE' || !PADRAO_DECISAO.test(t.title)) continue;
        if (fupReal < 9 || t.title !== tituloDecisao) {
          ops.push({ kind: 'deleteTask', taskId: t.id });
        }
      }

      const decisaoAberta = tarefas.find(
        (t) => t.title === tituloDecisao && t.status !== 'DONE',
      );

      if (fupReal >= 9 && !decisaoAberta) {
        ops.push(
          opCreate(
            opp.id,
            tituloDecisao,
            agora.toISOString(),
            zap,
            markdownDecisao(zap),
          ),
        );
      }
    } else {
      // BREAK: só a "FUP final" (+25 dias, 11h SP) fica de pé; decisão e FUPs somem.
      const tituloFinal = tituloFinalDe(opp.name);

      for (const t of tarefas) {
        if (t.status === 'DONE') continue;

        const fupIndevida = PADRAO_FUP.test(t.title) && t.title !== tituloFinal;

        if (fupIndevida || PADRAO_DECISAO.test(t.title)) {
          ops.push({ kind: 'deleteTask', taskId: t.id });
        }
      }

      const jaFinal = tarefas.find((t) => t.title === tituloFinal);

      if (!jaFinal) {
        ops.push(opCreate(opp.id, tituloFinal, horarioSP(agora, 25, 11, 0), zap));
      } else if (jaFinal.status !== 'DONE' && zap && linkDesatualizado(jaFinal)) {
        ops.push({ kind: 'updateTask', taskId: jaFinal.id, data: camposZap(zap) });
      }
    }
  }

  // Órfãs: task gerenciada aberta apontando pra negócio que saiu do funil vivo.
  for (const t of abertas) {
    if (!PADRAO_FUP.test(t.title) && !PADRAO_DECISAO.test(t.title)) continue;
    if (!t.targetOpportunityId) continue;

    const opp = foraDoFunil[t.targetOpportunityId];

    if (!opp) continue;
    if (opp.stage !== 'EM_NEGOCIACAO' && opp.stage !== 'BREAK') {
      ops.push({ kind: 'deleteTask', taskId: t.id });
    }
  }

  // Perdido sem motivo ganha a task-guarda (due imediato, sem zap).
  for (const perdida of perdidasSemMotivo) {
    const titulo = tituloMotivoDe(perdida.name);

    if (!abertas.find((t) => t.title === titulo)) {
      ops.push(opCreate(perdida.id, titulo, agora.toISOString(), null));
    }
  }

  // Guarda de motivo some quando o motivo entra (ou o card sai de Perdido); dedup.
  const vistosMotivo: Record<string, boolean> = {};

  for (const t of abertas) {
    if (!PADRAO_MOTIVO.test(t.title)) continue;
    if (!t.targetOpportunityId) continue;

    const opp = foraDoFunil[t.targetOpportunityId];

    if (!opp) continue;
    if (opp.stage !== 'LOST' || opp.motivoLost || vistosMotivo[t.title]) {
      ops.push({ kind: 'deleteTask', taskId: t.id });
    } else {
      vistosMotivo[t.title] = true;
    }
  }

  return ops;
}
