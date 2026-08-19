import { defineLogicFunction } from 'twenty-sdk/define';

import { OPPORTUNITY_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { reconcile, type ResultadoReconcile } from 'src/cadencia/reconcile.ts';

// Campainha: arrastar o card (stage), corrigir o número (whatsapp), preencher o motivo
// da perda ou ajustar o fupNumero reconcilia na hora. updatedFields evita disparo em
// edições irrelevantes (nota, valor etc.).
const handler = async (): Promise<ResultadoReconcile> => {
  return reconcile('opportunity.updated');
};

export default defineLogicFunction({
  universalIdentifier: OPPORTUNITY_UPDATED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'cadencia-on-opportunity-updated',
  description:
    'Reconcilia a cadência quando etapa, fupNumero, motivo da perda ou WhatsApp de um negócio mudam.',
  timeoutSeconds: 120,
  databaseEventTriggerSettings: {
    eventName: 'opportunity.updated',
    updatedFields: ['stage', 'fupNumero', 'motivoLost', 'whatsapp'],
  },
  handler,
});
