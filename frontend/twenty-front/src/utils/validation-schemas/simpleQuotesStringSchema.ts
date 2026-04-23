import { z } from 'zod';

export const simpleQuotesStringSchema = z
  .string()
  .refine(
    (value: string): value is `'${string}'` =>
      value.startsWith("'") && value.endsWith("'"),
    {
      error: 'String should be wrapped in simple quotes',
    },
  );
