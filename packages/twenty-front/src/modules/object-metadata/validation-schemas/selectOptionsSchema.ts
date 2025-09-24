import { z } from 'zod';

import { themeColorSchema } from 'twenty-ui/theme';
import { computeOptionValueFromLabel } from '~/pages/settings/data-model/utils/computeOptionValueFromLabel';

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
      error: 'Label is not transliterable',
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
      error: 'Options must have unique ids',
    },
  )
  .refine(
    (options) => {
      const optionValues = options.map(({ value }) => value);
      return new Set(optionValues).size === options.length;
    },
    {
      error: 'Options must have unique values',
    },
  )
  .refine(
    (options) =>
      [...options].sort().every((option, index) => option.position === index),
    {
      error: 'Options positions must be sequential',
    },
  );
