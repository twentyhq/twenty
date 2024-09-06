import { z } from 'zod';

import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
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
          message: `A string não é uma opção válida de múltipla seleção, as opções disponíveis são: ${options.join(
            ', ',
          )}`,
        },
      ),
    )
    .nullable();
};
