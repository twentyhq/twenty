import { type JSONSchema7 } from 'json-schema';

export const FIND_ONE_TOOL_INPUT_SCHEMA: JSONSchema7 = {
  type: 'object',
  properties: {
    id: {
      description: 'The unique UUID of the record to retrieve',
      type: 'string',
      format: 'uuid',
    },
    select: {
      description:
        'Fields to include in the response. Required. ' +
        "Use '*' to return all fields. " +
        'Relation fields resolve to related records as {id, label} summaries: ' +
        'MANY_TO_ONE returns a single object (or select the <name>Id FK column for just the id), ' +
        'ONE_TO_MANY returns up to 60 related records.',
      minItems: 1,
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['id', 'select'],
};
