import { z } from 'zod';

export const DoubleTextTypeResolver = z.object({
  firstValue: z.string(),
  secondValue: z.string(),
});
