import { z } from 'zod';

import { themeColorSchema } from '@/ui/theme/utils/themeColorSchema';

const selectValueSchema = z.object({
  color: themeColorSchema,
  label: z.string(),
});

export const isFieldSelectValue = (
  fieldValue: unknown,
): fieldValue is z.infer<typeof selectValueSchema> =>
  selectValueSchema.safeParse(fieldValue).success;
