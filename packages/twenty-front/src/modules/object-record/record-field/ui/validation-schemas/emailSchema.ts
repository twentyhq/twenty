import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .pipe(z.email({ error: 'Invalid email' }));
