import { isNonEmptyString } from '@sniptt/guards';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldSelectValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { selectFieldDefaultValueSchema } from '@/object-record/record-field/ui/validation-schemas/selectFieldDefaultValueSchema';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

export const getSelectFieldPreviewValue = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'defaultValue' | 'options' | 'type'
  >;
}): FieldSelectValue => {
  const firstOptionValue = fieldMetadataItem.options?.[0]?.value;

  if (
    fieldMetadataItem.type !== FieldMetadataType.SELECT ||
    !isDefined(fieldMetadataItem.options) ||
    !isDefined(firstOptionValue)
  ) {
    return null;
  }

  return selectFieldDefaultValueSchema(fieldMetadataItem.options)
    .refine(isDefined)
    .transform((value) => stripSimpleQuotesFromString(value ?? ''))
    .refine(isNonEmptyString)
    .catch(firstOptionValue)
    .parse(fieldMetadataItem.defaultValue);
};
