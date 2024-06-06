import { isNonEmptyArray } from '@apollo/client/utilities';
import { isNonEmptyString } from '@sniptt/guards';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMultiSelectValue } from '@/object-record/record-field/types/FieldMetadata';
import { multiSelectFieldDefaultValueSchema } from '@/object-record/record-field/validation-schemas/multiSelectFieldDefaultValueSchema';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

export const getMultiSelectFieldPreviewValue = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'defaultValue' | 'options' | 'type'
  >;
}): FieldMultiSelectValue => {
  if (
    fieldMetadataItem.type !== FieldMetadataType.MultiSelect ||
    !fieldMetadataItem.options?.length
  ) {
    return null;
  }

  const allOptionValues = fieldMetadataItem.options.map(({ value }) => value);

  return multiSelectFieldDefaultValueSchema(fieldMetadataItem.options)
    .refine(isDefined)
    .transform((value) =>
      value.map(stripSimpleQuotesFromString).filter(isNonEmptyString),
    )
    .refine(isNonEmptyArray)
    .catch(allOptionValues)
    .parse(fieldMetadataItem.defaultValue);
};
