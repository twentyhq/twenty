import { z } from 'zod';

export const fullNameFieldValueSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
});
