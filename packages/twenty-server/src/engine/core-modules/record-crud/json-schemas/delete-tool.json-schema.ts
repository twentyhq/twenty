import { type JSONSchema7 } from 'json-schema';

export const DELETE_TOOL_INPUT_SCHEMA: JSONSchema7 = {
  type: 'object',
  properties: {
    id: {
      description: 'The unique UUID of the record to delete',
      type: 'string',
      format: 'uuid',
    },
  },
  required: ['id'],
};
