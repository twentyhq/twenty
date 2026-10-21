import { z } from 'zod';
import { t } from '@lingui/core/macro';

import { themeColorSchema } from 'twenty-ui/utilities';
import { computeOptionValueFromLabel } from '@/object-metadata/utils/computeOptionValueFromLabel';

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
      } catch {
        return false;
      }
    },
    {
      error: () => t`Label is not transliterable`,
    },
  );

export const selectOptionsSchema = z
  .array(selectOptionSchema)
  .min(1)
  .refine(
    (options) => {
      const optionIds = options.map(({ id }) => id);
      return new Set(optionIds).size === options.length;
    },
    {
      error: () => t`Options must have unique ids`,
    },
  )
  .refine(
    (options) => {
      const optionValues = options.map(({ value }) => value);
      return new Set(optionValues).size === options.length;
    },
    {
      error: () => t`Options must have unique values`,
    },
  )
  .refine(
    (options) =>
      [...options].sort().every((option, index) => option.position === index),
    {
      error: () => t`Options positions must be sequential`,
    },
  );
