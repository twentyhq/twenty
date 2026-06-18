import { defineLogicFunction } from 'twenty-sdk/define';

import { UPDATE_FIELDS_OPTION_VALUES } from 'src/constants/update-fields-options';
import { PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';
import { enrichPersonCore } from 'src/logic-functions/handlers/enrich-person';
import { type SingleEnrichInput } from 'src/types/single-enrich-input';

const handler = (input: SingleEnrichInput) => enrichPersonCore({ input });

export default defineLogicFunction({
  universalIdentifier: PDL_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIERS.enrichPerson,
  name: 'enrich-person',
  description:
    'Enrich a single Person record with People Data Labs data (job, location, social profiles, etc.) given its record id.',
  timeoutSeconds: 60,
  handler,
  workflowActionTriggerSettings: {
    label: 'Enrich Person',
    icon: 'IconSparkles',
    inputSchema: [
      {
        type: 'object',
        properties: {
          recordId: {
            type: 'string',
            label: 'Record',
          },
          updateFields: {
            type: 'string',
            label: 'Update fields',
            enum: [...UPDATE_FIELDS_OPTION_VALUES],
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
          data: { type: 'object', label: 'Data' },
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
          description: 'The id of the Person record to enrich.',
        },
        updateFields: {
          type: 'string',
          enum: [...UPDATE_FIELDS_OPTION_VALUES],
          description:
            'Whether to write the enriched data back to the record. "Yes and overwrite" replaces existing values; "Yes and don\'t overwrite" only fills empty fields; "No" returns the enriched data without modifying the record.',
        },
      },
      required: ['recordId'],
      additionalProperties: false,
    },
  },
});
