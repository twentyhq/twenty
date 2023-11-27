import { z } from 'zod';

import { mainColors, ThemeColor } from '@/ui/theme/constants/colors';

const selectColors = Object.keys(mainColors) as [ThemeColor, ...ThemeColor[]];
const selectValueSchema = z.object({
  color: z.enum(selectColors),
  label: z.string(),
});

export const isFieldSelectValue = (
  fieldValue: unknown,
): fieldValue is z.infer<typeof selectValueSchema> =>
  selectValueSchema.safeParse(fieldValue).success;
