import { z } from 'zod';
import { t } from '@lingui/core/macro';

import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';
import { simpleQuotesStringSchema } from '~/utils/validation-schemas/simpleQuotesStringSchema';

export const multiSelectFieldDefaultValueSchema = (
  options?: FieldMetadataItemOption[],
) => {
  if (!options?.length) return z.array(simpleQuotesStringSchema).nullable();

  const optionValues = options.map(({ value }) => value);

  return z
    .array(
      simpleQuotesStringSchema.refine(
        (value) => optionValues.includes(stripSimpleQuotesFromString(value)),
        {
          error: () =>
            t`String is not a valid multi-select option, available options are: ${optionValues.join(
              ', ',
            )}`,
        },
      ),
    )
    .nullable();
};
