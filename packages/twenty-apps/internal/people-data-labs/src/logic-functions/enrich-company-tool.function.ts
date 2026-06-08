import { defineLogicFunction } from 'twenty-sdk/define';

import { PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { enrichCompanyCore } from 'src/logic-functions/handlers/enrich-company';
import { type EnrichInput } from 'src/types/enrich-input';

const handler = (input: EnrichInput) => enrichCompanyCore(input);

export default defineLogicFunction({
  universalIdentifier:
    PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichCompanyTool,
  name: 'enrich-company-tool',
  description:
    'Enrich a Company record with People Data Labs data (industry, size, funding, location, etc.) given its record id.',
  timeoutSeconds: 30,
  handler,
  toolTriggerSettings: {
    inputSchema: {
      type: 'object',
      properties: {
        recordId: {
          type: 'string',
          description: 'The id of the Company record to enrich.',
        },
        force: {
          type: 'boolean',
          description:
            'Re-enrich even if the record was enriched recently (bypasses the freshness guard).',
        },
      },
      required: ['recordId'],
      additionalProperties: false,
    },
  },
});
