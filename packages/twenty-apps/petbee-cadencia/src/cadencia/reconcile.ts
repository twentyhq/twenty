// Lê a fotografia do CRM, calcula o plano (plan.ts) e — fora do modo sombra — executa.
// Toda entrada do motor (cron ou evento) passa por aqui; falhas disparam o alerta.
import { CoreApiClient } from 'twenty-client-sdk/core';

import { PADRAO_DECISAO, PADRAO_FUP, PADRAO_MOTIVO } from './regua.ts';
import {
  computePlan,
  type OppDoFunil,
  type OppForaDoFunil,
  type PlanOp,
  type TaskAberta,
  type TaskDoFunil,
} from './plan.ts';

type Edge<T> = { node: T };
type Conexao<T> = { edges: Edge<T>[] } | null | undefined;

function nodesDe<T>(conexao: Conexao<T>): T[] {
  return (conexao?.edges ?? []).map((edge) => edge.node);
}

const GERENCIADA = (titulo: string): boolean =>
  PADRAO_FUP.test(titulo) || PADRAO_DECISAO.test(titulo) || PADRAO_MOTIVO.test(titulo);

async function carregarFunil(client: CoreApiClient): Promise<OppDoFunil[]> {
  const resposta = (await client.query({
    opportunities: {
      __args: {
        filter: {
          or: [{ stage: { eq: 'EM_NEGOCIACAO' } }, { stage: { eq: 'BREAK' } }],
        },
        first: 200,
      },
      edges: {
        node: {
          id: true,
          name: true,
          stage: true,
          fupNumero: true,
          whatsapp: true,
          taskTargets: {
            edges: {
              node: {
                task: {
                  id: true,
                  title: true,
                  status: true,
                  dueAt: true,
                  whatsapp: { primaryLinkUrl: true },
                },
              },
            },
          },
        },
      },
    },
  })) as {
    opportunities: Conexao<{
      id: string;
      name: string;
      stage: string;
      fupNumero?: number | null;
      whatsapp?: string | null;
      taskTargets: Conexao<{ task: TaskDoFunil | null }>;
    }>;
  };

  return nodesDe(resposta.opportunities).map((opp) => ({
    id: opp.id,
    name: opp.name,
    stage: opp.stage,
    fupNumero: opp.fupNumero,
    whatsapp: opp.whatsapp,
    tarefas: nodesDe(opp.taskTargets)
      .map((alvo) => alvo.task)
      .filter((task): task is TaskDoFunil => task != null),
  }));
}

async function carregarAbertas(client: CoreApiClient): Promise<TaskAberta[]> {
  const resposta = (await client.query({
    tasks: {
      __args: { filter: { status: { eq: 'TODO' } }, first: 300 },
      edges: {
        node: {
          id: true,
          title: true,
          taskTargets: { edges: { node: { targetOpportunityId: true } } },
        },
      },
    },
  })) as {
    tasks: Conexao<{
      id: string;
      title: string;
      taskTargets: Conexao<{ targetOpportunityId: string | null }>;
    }>;
  };

  return nodesDe(resposta.tasks).map((task) => ({
    id: task.id,
    title: task.title,
    targetOpportunityId:
      nodesDe(task.taskTargets)[0]?.targetOpportunityId ?? null,
  }));
}

async function carregarPerdidasSemMotivo(
  client: CoreApiClient,
): Promise<{ id: string; name: string }[]> {
  const resposta = (await client.query({
    opportunities: {
      __args: {
        filter: { stage: { eq: 'LOST' }, motivoLost: { is: 'NULL' } },
        first: 50,
      },
      edges: { node: { id: true, name: true } },
    },
  })) as { opportunities: Conexao<{ id: string; name: string }> };

  return nodesDe(resposta.opportunities);
}

async function carregarForaDoFunil(
  client: CoreApiClient,
  abertas: TaskAberta[],
  idsDoFunil: Set<string>,
): Promise<Record<string, OppForaDoFunil>> {
  const candidatas = new Set<string>();

  for (const task of abertas) {
    if (!GERENCIADA(task.title)) continue;
    if (task.targetOpportunityId && !idsDoFunil.has(task.targetOpportunityId)) {
      candidatas.add(task.targetOpportunityId);
    }
  }

  const ids = [...candidatas].slice(0, 100);

  if (!ids.length) return {};

  const resposta = (await client.query({
    opportunities: {
      __args: { filter: { id: { in: ids } }, first: 100 },
      edges: { node: { id: true, stage: true, motivoLost: true } },
    },
  })) as { opportunities: Conexao<OppForaDoFunil> };

  const mapa: Record<string, OppForaDoFunil> = {};

  for (const opp of nodesDe(resposta.opportunities)) mapa[opp.id] = opp;

  return mapa;
}

async function executarOp(client: CoreApiClient, op: PlanOp): Promise<void> {
  if (op.kind === 'createTask') {
    const criada = (await client.mutation({
      createTask: { __args: { data: op.data }, id: true },
    })) as { createTask: { id: string } };

    await client.mutation({
      createTaskTarget: {
        __args: {
          data: { taskId: criada.createTask.id, targetOpportunityId: op.oppId },
        },
        id: true,
      },
    });

    return;
  }

  if (op.kind === 'updateTask') {
    await client.mutation({
      updateTask: { __args: { id: op.taskId, data: op.data }, id: true },
    });

    return;
  }

  if (op.kind === 'deleteTask') {
    await client.mutation({ deleteTask: { __args: { id: op.taskId }, id: true } });

    return;
  }

  await client.mutation({
    updateOpportunity: { __args: { id: op.oppId, data: op.data }, id: true },
  });
}

function resumoDe(op: PlanOp): string {
  if (op.kind === 'createTask') return `createTask: ${op.data.title}`;
  if (op.kind === 'updateTask') return `updateTask ${op.taskId}: ${JSON.stringify(op.data)}`;
  if (op.kind === 'deleteTask') return `deleteTask ${op.taskId}`;

  return `updateOpportunity ${op.oppId}: fupNumero=${op.data.fupNumero}`;
}

async function avisarFalha(erro: unknown): Promise<void> {
  const webhook = (process.env.CADENCIA_ALERT_WEBHOOK_URL ?? '').trim();

  if (!webhook) return;

  const mensagem = erro instanceof Error ? erro.message : String(erro);

  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 Cadência Petbee (app): falha na reconciliação — ${mensagem}`,
      }),
    });
  } catch {
    // O alerta nunca pode mascarar o erro original.
  }
}

export type ResultadoReconcile = {
  gatilho: string;
  dryRun: boolean;
  totalOps: number;
  executadas: number;
  ops: string[];
};

export async function reconcile(gatilho: string): Promise<ResultadoReconcile> {
  // Sombra por padrão: só escreve quando a variável for exatamente "false".
  const dryRun = (process.env.CADENCIA_DRY_RUN ?? 'true').trim() !== 'false';

  try {
    const client = new CoreApiClient();

    const funil = await carregarFunil(client);
    const abertas = await carregarAbertas(client);
    const perdidasSemMotivo = await carregarPerdidasSemMotivo(client);
    const foraDoFunil = await carregarForaDoFunil(
      client,
      abertas,
      new Set(funil.map((opp) => opp.id)),
    );

    const ops = computePlan({
      agora: new Date(),
      funil,
      abertas,
      perdidasSemMotivo,
      foraDoFunil,
    });

    let executadas = 0;

    if (!dryRun) {
      for (const op of ops) {
        await executarOp(client, op);
        executadas += 1;
      }
    }

    const resultado: ResultadoReconcile = {
      gatilho,
      dryRun,
      totalOps: ops.length,
      executadas,
      ops: ops.map(resumoDe),
    };

    console.log(`[cadencia] ${JSON.stringify(resultado)}`);

    return resultado;
  } catch (erro) {
    await avisarFalha(erro);
    throw erro;
  }
}
