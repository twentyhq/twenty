import { z } from 'zod';

import { GRANOLA_MAX_PAGE_SIZE } from 'src/constants/granola-api.constant';

export const GRANOLA_PAGE_PARAMETERS_SCHEMA = z.object({
  cursor: z.string().min(1).optional(),
  limit: z
    .number()
    .int()
    .min(1)
    .max(GRANOLA_MAX_PAGE_SIZE)
    .default(GRANOLA_MAX_PAGE_SIZE),
});
