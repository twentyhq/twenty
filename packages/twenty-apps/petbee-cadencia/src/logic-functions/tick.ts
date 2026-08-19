import { defineLogicFunction } from 'twenty-sdk/define';

import { TICK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { reconcile, type ResultadoReconcile } from 'src/cadencia/reconcile.ts';

// Rede de segurança: mesmo que algum evento se perca, a cada 5 minutos o estado
// desejado é reconferido do zero — nenhuma task fica faltando ou sobrando por muito tempo.
const handler = async (): Promise<ResultadoReconcile> => {
  return reconcile('tick');
};

export default defineLogicFunction({
  universalIdentifier: TICK_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'cadencia-tick',
  description:
    'Reconciliação periódica da régua comercial (rede de segurança da cadência).',
  timeoutSeconds: 120,
  cronTriggerSettings: {
    pattern: '*/5 * * * *',
  },
  handler,
});
