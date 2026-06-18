import { defineLogicFunction } from 'twenty-sdk/define';

import { PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { enrichCompanyCore } from 'src/logic-functions/handlers/enrich-company';
import { type SingleEnrichInput } from 'src/types/single-enrich-input';

const handler = (input: SingleEnrichInput) => enrichCompanyCore({ input });

export default defineLogicFunction({
  universalIdentifier: PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichCompany,
  name: 'enrich-company',
  description:
    'Enrich a single Company record with People Data Labs data (industry, size, funding, location, etc.) given its record id.',
  timeoutSeconds: 60,
  handler,
  workflowActionTriggerSettings: {
    label: 'Enrich Company',
    icon: 'IconSparkles',
    inputSchema: [
      {
        type: 'object',
        properties: {
          recordId: {
            type: 'string',
            label: 'Record',
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
          recordId: { type: 'string', label: 'Record Id' },
          status: { type: 'string', label: 'Status' },
          updatedFields: {
            type: 'array',
            items: { type: 'string' },
            label: 'Updated Fields',
          },
          message: { type: 'string', label: 'Message' },
        },
      },
    ],
  },
  toolTriggerSettings: {
    inputSchema: {
      type: 'object',
      properties: {
        recordId: {
          type: 'string',
          description: 'The id of the Company record to enrich.',
        },
        overrideExistingValues: {
          type: 'boolean',
          description:
            'Overwrite existing field values with the enriched data instead of only filling empty fields.',
        },
      },
      required: ['recordId'],
      additionalProperties: false,
    },
  },
});
