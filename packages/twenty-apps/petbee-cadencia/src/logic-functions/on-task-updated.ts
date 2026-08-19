import { defineLogicFunction } from 'twenty-sdk/define';

import { TASK_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { reconcile, type ResultadoReconcile } from 'src/cadencia/reconcile.ts';

// Campainha principal do dia a dia: a Vitória dá done na FUP N e a N+1 nasce em segundos.
const handler = async (): Promise<ResultadoReconcile> => {
  return reconcile('task.updated');
};

export default defineLogicFunction({
  universalIdentifier: TASK_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'cadencia-on-task-updated',
  description: 'Reconcilia a cadência quando o status de uma task muda.',
  timeoutSeconds: 120,
  databaseEventTriggerSettings: {
    eventName: 'task.updated',
    updatedFields: ['status'],
  },
  handler,
});
