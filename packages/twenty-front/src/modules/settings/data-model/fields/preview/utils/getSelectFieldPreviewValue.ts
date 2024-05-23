import { isNonEmptyString } from '@sniptt/guards';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldSelectValue } from '@/object-record/record-field/types/FieldMetadata';
import { selectFieldDefaultValueSchema } from '@/object-record/record-field/validation-schemas/selectFieldDefaultValueSchema';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

export const getSelectFieldPreviewValue = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'defaultValue' | 'options' | 'type'
  >;
}): FieldSelectValue => {
  if (
    fieldMetadataItem.type !== FieldMetadataType.Select ||
    !fieldMetadataItem.options?.length
  ) {
    return null;
  }

  const firstOptionValue = fieldMetadataItem.options[0].value;

  return selectFieldDefaultValueSchema(fieldMetadataItem.options)
    .refine(isDefined)
    .transform(stripSimpleQuotesFromString)
    .refine(isNonEmptyString)
    .catch(firstOptionValue)
    .parse(fieldMetadataItem.defaultValue);
};
