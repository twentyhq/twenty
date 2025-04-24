import { z } from 'zod';

const relationFilterValueItemSchema = z.union([
  z.string().uuid(),
  z.literal('{{CURRENT_WORKSPACE_MEMBER}}'),
]);

const relationFilterValueArraySchema = z.array(relationFilterValueItemSchema);

export const relationFilterValueSchema = z
  .string()
  .transform((value, ctx) => {
    if (value === '') {
      return [];
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: (error as Error).message,
      });
      return z.NEVER;
    }
  })
  .pipe(relationFilterValueArraySchema);
