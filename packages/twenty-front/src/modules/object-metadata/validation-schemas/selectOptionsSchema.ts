import { themeColorSchema } from 'twenty-ui';
import { z } from 'zod';

import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { getOptionValueFromLabel } from '@/settings/data-model/fields/forms/select/utils/getOptionValueFromLabel';
import { computeOptionValueFromLabelOrThrow } from '~/pages/settings/data-model/utils/compute-option-value-from-label.utils';

const selectOptionSchema = z
  .object({
    color: themeColorSchema,
    id: z.string(),
    label: z.string().trim().min(1),
    position: z.number(),
    value: z.string(),
  })
  .refine((option) => option.value === getOptionValueFromLabel(option.label), {
    message: 'O valor não corresponde ao rótulo',
  })
  .refine(
    (option) => {
      try {
        computeOptionValueFromLabelOrThrow(option.label);
        return true;
      } catch (error) {
        return false;
      }
    },
    {
      message: 'O rótulo não é transliterável',
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
      message: 'As opções devem ter IDs únicos',
    },
  )
  .refine(
    (options) => {
      const optionValues = options.map(({ value }) => value);
      return new Set(optionValues).size === options.length;
    },
    {
      message: 'As opções devem ter valores únicos',
    },
  )
  .refine(
    (options) =>
      [...options].sort().every((option, index) => option.position === index),
    {
      message: 'As posições das opções devem ser sequenciais',
    },
  );
