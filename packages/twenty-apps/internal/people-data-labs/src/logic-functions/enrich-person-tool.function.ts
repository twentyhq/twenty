import { defineLogicFunction } from 'twenty-sdk/define';

import { PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { enrichPersonCore } from 'src/logic-functions/handlers/enrich-person';
import { type EnrichInput } from 'src/types/enrich-input';

const handler = (input: EnrichInput) => enrichPersonCore(input);

export default defineLogicFunction({
  universalIdentifier: PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichPersonTool,
  name: 'enrich-person-tool',
  description:
    'Enrich a Person record with People Data Labs data (job, location, social profiles, etc.) given its record id.',
  timeoutSeconds: 30,
  handler,
  toolTriggerSettings: {
    inputSchema: {
      type: 'object',
      properties: {
        recordId: {
          type: 'string',
          description: 'The id of the Person record to enrich.',
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
