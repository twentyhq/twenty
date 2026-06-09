import { defineLogicFunction } from 'twenty-sdk/define';

import { PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { enrichPeopleCore } from 'src/logic-functions/handlers/enrich-people';
import { buildEmptyToolResult } from 'src/logic-functions/utils/build-empty-tool-result';
import { buildToolRecordIds } from 'src/logic-functions/utils/build-tool-record-ids';
import { type EnrichToolInput } from 'src/types/enrich-tool-input';

const handler = (input: EnrichToolInput) => {
  const records = buildToolRecordIds(input);

  if (records.length === 0) {
    return Promise.resolve(buildEmptyToolResult());
  }

  return enrichPeopleCore({ input: { records, force: input.force } });
};

export default defineLogicFunction({
  universalIdentifier: PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichPersonTool,
  name: 'enrich-person-tool',
  description:
    'Enrich one or more Person records with People Data Labs data (job, location, social profiles, etc.) given their record ids. Provide recordId for a single record or recordIds for multiple.',
  timeoutSeconds: 300,
  handler,
  toolTriggerSettings: {
    inputSchema: {
      type: 'object',
      properties: {
        recordId: {
          type: 'string',
          description: 'The id of a single Person record to enrich.',
        },
        recordIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'The ids of multiple Person records to enrich in one call.',
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
