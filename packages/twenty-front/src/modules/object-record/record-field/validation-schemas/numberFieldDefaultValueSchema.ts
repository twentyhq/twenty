import { z } from 'zod';

export const numberFieldDefaultValueSchema = z.object({
  decimals: z.number().nullable(),
  type: z.enum(['percentage', 'number']).nullable(),
});
