import { isNonEmptyArray } from '@apollo/client/utilities';
import { isNonEmptyString } from '@sniptt/guards';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMultiSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { multiSelectFieldDefaultValueSchema } from '@/object-record/record-field/ui/validation-schemas/multiSelectFieldDefaultValueSchema';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
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
    fieldMetadataItem.type !== FieldMetadataType.MULTI_SELECT ||
    !fieldMetadataItem.options?.length
  ) {
    return null;
  }

  const allOptionValues = fieldMetadataItem.options.map(({ value }) => value);

  return multiSelectFieldDefaultValueSchema(fieldMetadataItem.options)
    .refine(isDefined)
    .transform(
      (value) =>
        value?.map(stripSimpleQuotesFromString).filter(isNonEmptyString) ?? [],
    )
    .refine(isNonEmptyArray)
    .catch(allOptionValues)
    .parse(fieldMetadataItem.defaultValue);
};
