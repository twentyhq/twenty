import { z } from 'zod';

import { mainColors, ThemeColor } from '@/ui/theme/constants/colors';

const enumColors = Object.keys(mainColors) as [ThemeColor, ...ThemeColor[]];
const enumValueSchema = z.object({
  color: z.enum(enumColors),
  text: z.string(),
});

export const isFieldEnumValue = (
  fieldValue: unknown,
): fieldValue is z.infer<typeof enumValueSchema> =>
  enumValueSchema.safeParse(fieldValue).success;
