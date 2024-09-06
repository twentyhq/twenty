import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';
import { simpleQuotesStringSchema } from '~/utils/validation-schemas/simpleQuotesStringSchema';

export const selectFieldDefaultValueSchema = (
  options?: FieldMetadataItemOption[],
) => {
  if (!options?.length) return simpleQuotesStringSchema.nullable();

  const optionValues = options.map(({ value }) => value);

  return simpleQuotesStringSchema
    .refine(
      (value) => optionValues.includes(stripSimpleQuotesFromString(value)),
      {
        message: `A string não é uma opção válida de seleção, as opções disponíveis são: ${options.join(
          ', ',
        )}`,
      },
    )
    .nullable();
};
