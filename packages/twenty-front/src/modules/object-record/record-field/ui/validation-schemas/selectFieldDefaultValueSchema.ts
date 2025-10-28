import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
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
        message: `String is not a valid select option, available options are: ${options.join(
          ', ',
        )}`,
      },
    )
    .nullable();
};
