import { themeColorSchema } from 'twenty-ui';
import { z } from 'zod';

import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { computeOptionValueFromLabel } from '~/pages/settings/data-model/utils/compute-option-value-from-label.utils';

const selectOptionSchema = z
  .object({
    color: themeColorSchema,
    id: z.string(),
    label: z.string().trim().min(1),
    position: z.number(),
    value: z.string(),
  })
  .refine(
    (option) => {
      try {
        computeOptionValueFromLabel(option.label);
        return true;
      } catch (error) {
        return false;
      }
    },
    {
      message: 'Label is not transliterable',
    },
  ) satisfies z.ZodType<FieldMetadataItemOption>;

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
