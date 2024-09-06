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
      message: 'A string deve estar envolvida em aspas simples',
    },
  );
