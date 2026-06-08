import { defineLogicFunction } from 'twenty-sdk/define';

import { PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { enrichPersonBulkCore } from 'src/logic-functions/handlers/enrich-person-bulk';
import { type BulkEnrichInput } from 'src/types/bulk-enrich-input';

const handler = (input: BulkEnrichInput) => enrichPersonBulkCore({ input });

export default defineLogicFunction({
  universalIdentifier: PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichPerson,
  name: 'enrich-person',
  description: 'Enrich one or more Person records with People Data Labs data',
  timeoutSeconds: 300,
  handler,
  workflowActionTriggerSettings: {
    label: 'Enrich with People Data Labs',
    icon: 'IconSparkles',
    inputSchema: [
      {
        type: 'object',
        properties: {
          records: { type: 'array', items: { type: 'object' } },
          force: { type: 'boolean' },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          total: { type: 'number' },
          matched: { type: 'number' },
          notFound: { type: 'number' },
          skipped: { type: 'number' },
          errored: { type: 'number' },
        },
      },
    ],
  },
});
