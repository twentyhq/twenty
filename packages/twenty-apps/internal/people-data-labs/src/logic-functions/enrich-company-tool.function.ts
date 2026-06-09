import { defineLogicFunction } from 'twenty-sdk/define';

import { PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { enrichCompaniesCore } from 'src/logic-functions/handlers/enrich-companies';
import { buildToolRecordIds } from 'src/logic-functions/utils/build-tool-record-ids';
import { type EnrichToolInput } from 'src/types/enrich-tool-input';

const handler = (input: EnrichToolInput) =>
  enrichCompaniesCore({
    input: { records: buildToolRecordIds(input), force: input.force },
  });

export default defineLogicFunction({
  universalIdentifier:
    PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichCompanyTool,
  name: 'enrich-company-tool',
  description:
    'Enrich one or more Company records with People Data Labs data (industry, size, funding, location, etc.) given their record ids. Provide recordId for a single record or recordIds for multiple.',
  timeoutSeconds: 300,
  handler,
  toolTriggerSettings: {
    inputSchema: {
      type: 'object',
      properties: {
        recordId: {
          type: 'string',
          description: 'The id of a single Company record to enrich.',
        },
        recordIds: {
          type: 'array',
          items: { type: 'string' },
          description:
            'The ids of multiple Company records to enrich in one call.',
        },
        force: {
          type: 'boolean',
          description:
            'Re-enrich even if the record was enriched recently (bypasses the freshness guard).',
        },
      },
      anyOf: [{ required: ['recordId'] }, { required: ['recordIds'] }],
      additionalProperties: false,
    },
  },
});
