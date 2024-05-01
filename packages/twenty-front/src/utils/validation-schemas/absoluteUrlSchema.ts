import { z } from 'zod';

export const absoluteUrlSchema = z
  .string()
  .url()
  .or(
    z
      .string()
      .transform((value) => `https://${value}`)
      .pipe(z.string().url()),
  );
