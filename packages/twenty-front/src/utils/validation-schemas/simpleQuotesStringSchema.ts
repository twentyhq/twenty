import { z } from 'zod';

export const simpleQuotesStringSchema = z
  .string()
  .refine((value) => value.startsWith("'") && value.endsWith("'"), {
    message: 'String should be wrapped in simple quotes',
  });
