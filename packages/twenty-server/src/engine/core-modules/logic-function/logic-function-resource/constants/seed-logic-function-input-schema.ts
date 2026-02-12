import type { InputJsonSchema } from 'twenty-shared/logic-function';

export const SEED_LOGIC_FUNCTION_INPUT_SCHEMA: InputJsonSchema = {
  type: 'object',
  properties: {
    a: { type: 'string' },
    b: { type: 'number' },
  },
};
