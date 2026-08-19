import { defineLogicFunction } from 'twenty-sdk/define';

import { OPPORTUNITY_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { reconcile, type ResultadoReconcile } from 'src/cadencia/reconcile.ts';

// Campainha: negócio novo (ex.: lead da LP já qualificado) ganha a task certa em segundos.
// O payload não é usado — o reconciliador sempre lê a verdade inteira do CRM.
const handler = async (): Promise<ResultadoReconcile> => {
  return reconcile('opportunity.created');
};

export default defineLogicFunction({
  universalIdentifier: OPPORTUNITY_CREATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'cadencia-on-opportunity-created',
  description: 'Reconcilia a cadência quando um negócio é criado.',
  timeoutSeconds: 120,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.created',
  },
  handler,
});
