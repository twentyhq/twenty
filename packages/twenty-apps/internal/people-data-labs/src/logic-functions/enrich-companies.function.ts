import { defineLogicFunction } from 'twenty-sdk/define';

import { PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { enrichCompaniesCore } from 'src/logic-functions/handlers/enrich-companies';
import { type BulkEnrichInput } from 'src/types/bulk-enrich-input';

const handler = (input: BulkEnrichInput) => enrichCompaniesCore({ input });

export default defineLogicFunction({
  universalIdentifier: PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichCompanies,
  name: 'enrich-companies',
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
          records: {
            type: 'array',
            items: { type: 'object' },
            label: 'Records',
          },
          overrideExistingValues: {
            type: 'boolean',
            label: 'Override Existing Values',
          },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean', label: 'Success' },
          total: { type: 'number', label: 'Total' },
          matched: { type: 'number', label: 'Matched' },
          notFound: { type: 'number', label: 'Not Found' },
          skipped: { type: 'number', label: 'Skipped' },
          errored: { type: 'number', label: 'Errored' },
        },
      },
    ],
  },
});
