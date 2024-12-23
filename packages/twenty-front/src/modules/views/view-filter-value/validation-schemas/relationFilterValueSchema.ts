import { z } from 'zod';

export const relationFilterValueSchema = z
  .string()
  .transform((value, ctx) => {
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
  .pipe(
    z.object({
      isCurrentWorkspaceMemberSelected: z.boolean(),
      selectedRecordIds: z.array(z.string()),
    }),
  );
