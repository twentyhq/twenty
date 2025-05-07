import { CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

const relationFilterValueItemSchema = z.union([
  z.string().uuid(),
  z.literal(CURRENT_WORKSPACE_MEMBER_SELECTABLE_ITEM_ID),
]);

const relationFilterValueArraySchema = z.array(relationFilterValueItemSchema);

export const relationFilterValueSchema = z
  .string()
  .optional()
  .transform((value, ctx) => {
    if (!isDefined(value) || value === '') {
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
