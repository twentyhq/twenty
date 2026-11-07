import { type JSONSchema7 } from 'json-schema';
import { MUTATION_MAX_MERGE_RECORDS } from 'twenty-shared/constants';

export const MERGE_MANY_TOOL_INPUT_SCHEMA: JSONSchema7 = {
  type: 'object',
  properties: {
    ids: {
      description: 'The UUIDs of the duplicate records to merge into one',
      type: 'array',
      items: { type: 'string', format: 'uuid' },
      minItems: 2,
      maxItems: MUTATION_MAX_MERGE_RECORDS,
    },
    conflictPriorityIndex: {
      description:
        'The position in ids of the record to keep. Its values win when the records have conflicting values',
      type: 'integer',
      minimum: 0,
    },
    dryRun: {
      description:
        'When true, returns the merged record as it would be saved without changing any data',
      type: 'boolean',
    },
  },
  required: ['ids', 'conflictPriorityIndex'],
};
