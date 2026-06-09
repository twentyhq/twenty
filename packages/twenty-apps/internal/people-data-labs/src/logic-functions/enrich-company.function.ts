import { defineLogicFunction } from 'twenty-sdk/define';

import { PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { enrichCompanyBulkCore } from 'src/logic-functions/handlers/enrich-company-bulk';
import { type BulkEnrichInput } from 'src/types/bulk-enrich-input';

const handler = (input: BulkEnrichInput) => enrichCompanyBulkCore({ input });

export default defineLogicFunction({
  universalIdentifier: PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichCompany,
  name: 'enrich-company',
  description: 'Enrich one or more Company records with People Data Labs data',
  timeoutSeconds: 300,
  handler,
  workflowActionTriggerSettings: {
    label: 'Enrich Companies',
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
