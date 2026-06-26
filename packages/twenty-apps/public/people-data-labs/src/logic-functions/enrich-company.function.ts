import { defineLogicFunction } from 'twenty-sdk/define';

import { UPDATE_FIELDS_OPTION_VALUES } from 'src/constants/update-fields-option-values';
import { PDL_LOGIC_FUNCTION_CONSTANTS } from 'src/constants/universal-identifiers';
import { enrichCompanyCore } from 'src/logic-functions/handlers/enrich-company';
import { type SingleEnrichInput } from 'src/types/single-enrich-input';

const handler = (input: SingleEnrichInput) => enrichCompanyCore({ input });

export default defineLogicFunction({
  universalIdentifier: PDL_LOGIC_FUNCTION_CONSTANTS.enrichCompany.universalIdentifier,
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
          description: 'The id of the Company record to enrich.',
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
