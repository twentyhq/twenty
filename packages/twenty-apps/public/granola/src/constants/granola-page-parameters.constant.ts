import { type InputJsonSchema } from 'twenty-sdk/logic-function';

import { GRANOLA_MAX_PAGE_SIZE } from 'src/constants/granola-api.constant';

export const GRANOLA_PAGE_PARAMETERS_INPUT_SCHEMA: Record<
  'cursor' | 'limit',
  InputJsonSchema
> = {
  cursor: {
    type: 'string',
    label: 'Cursor',
    description: 'The next cursor returned by the previous page.',
  },
  limit: {
    type: 'integer',
    label: 'Limit',
    description: `Maximum items in this page, between 1 and ${GRANOLA_MAX_PAGE_SIZE}. Defaults to ${GRANOLA_MAX_PAGE_SIZE}.`,
    minimum: 1,
    maximum: GRANOLA_MAX_PAGE_SIZE,
  },
};
