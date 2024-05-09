import { z } from 'zod';

export const simpleQuotesStringSchema: z.ZodType<
  `'${string}'`,
  z.ZodTypeDef,
  string
> = z
  .string()
  .refine(
    (value: string): value is `'${string}'` =>
      value.startsWith("'") && value.endsWith("'"),
    {
      message: 'String should be wrapped in simple quotes',
    },
  );
