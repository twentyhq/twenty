import { z } from 'zod';

import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { getOptionValueFromLabel } from '@/settings/data-model/fields/forms/utils/getOptionValueFromLabel';
import { themeColorSchema } from '@/ui/theme/utils/themeColorSchema';

const selectOptionSchema = z
  .object({
    color: themeColorSchema,
    id: z.string(),
    label: z.string().trim().min(1),
    position: z.number(),
    value: z.string(),
  })
  .refine((option) => option.value === getOptionValueFromLabel(option.label), {
    message: 'Value does not match label',
  }) satisfies z.ZodType<FieldMetadataItemOption>;

export const selectOptionsSchema = z
  .array(selectOptionSchema)
  .min(1)
  .refine(
    (options) => {
      const optionIds = options.map(({ id }) => id);
      return new Set(optionIds).size === options.length;
    },
    {
      message: 'Options must have unique ids',
    },
  )
  .refine(
    (options) => {
      const optionValues = options.map(({ value }) => value);
      return new Set(optionValues).size === options.length;
    },
    {
      message: 'Options must have unique values',
    },
  )
  .refine(
    (options) =>
      [...options].sort().every((option, index) => option.position === index),
    {
      message: 'Options positions must be sequential',
    },
  );
