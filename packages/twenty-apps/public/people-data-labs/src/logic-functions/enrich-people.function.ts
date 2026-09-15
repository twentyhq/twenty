import { defineLogicFunction, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { UPDATE_FIELDS_OPTION_VALUES } from 'src/constants/update-fields-option-values';
import { PDL_LOGIC_FUNCTION_CONSTANTS } from 'src/constants/universal-identifiers';
import { enrichPeopleCore } from 'src/logic-functions/handlers/enrich-people';
import { type EnrichInput, toBulkEnrichInput } from 'src/logic-functions/utils/to-bulk-enrich-input';

const handler = (input: EnrichInput) => {
  return enrichPeopleCore({ input: toBulkEnrichInput(input) });
};

export default defineLogicFunction({
  universalIdentifier: PDL_LOGIC_FUNCTION_CONSTANTS.enrichPeople.universalIdentifier,
  name: 'enrich-people',
  description: 'Enrich one or more Person records with People Data Labs data',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: PDL_LOGIC_FUNCTION_CONSTANTS.enrichPeople.path,
    httpMethod: 'POST',
    isAuthRequired: true
  },
  workflowActionTriggerSettings: {
    label: 'Enrich People',
    icon: 'IconSparkles',
    inputSchema: [
      {
        type: 'object',
        properties: {
          records: {
            type: 'records',
            objectUniversalIdentifier:
              STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
            label: 'Records',
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
          total: { type: 'number', label: 'Total' },
          matched: { type: 'number', label: 'Matched' },
          notFound: { type: 'number', label: 'Not Found' },
          skipped: { type: 'number', label: 'Skipped' },
          errored: { type: 'number', label: 'Errored' },
          results: {
            type: 'array',
            items: {
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
            label: 'Results',
          },
        },
      },
    ],
  },
});
