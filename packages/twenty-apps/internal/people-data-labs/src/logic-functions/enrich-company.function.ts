import { defineLogicFunction } from 'twenty-sdk/define';

import { PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { enrichCompanyCore } from 'src/logic-functions/handlers/enrich-company.core';
import { type EnrichInput } from 'src/types/enrich-input.type';

const handler = (input: EnrichInput) => enrichCompanyCore(input);

export default defineLogicFunction({
  universalIdentifier: PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichCompany,
  name: 'enrich-company',
  description: 'Enrich a Company with People Data Labs data',
  timeoutSeconds: 30,
  handler,
  workflowActionTriggerSettings: {
    label: 'Enrich with People Data Labs',
    icon: 'IconSparkles',
    inputSchema: [
      {
        type: 'object',
        properties: {
          recordId: { type: 'string' },
          force: { type: 'boolean' },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          status: { type: 'string' },
          updatedFields: { type: 'array', items: { type: 'string' } },
          message: { type: 'string' },
          error: { type: 'string' },
        },
      },
    ],
  },
});
