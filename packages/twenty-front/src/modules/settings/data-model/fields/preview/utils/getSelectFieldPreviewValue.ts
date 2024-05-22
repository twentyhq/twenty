import { isString } from '@sniptt/guards';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

export const getSelectFieldPreviewValue = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'type' | 'defaultValue' | 'options'
  >;
}) => {
  if (fieldMetadataItem.type !== FieldMetadataType.Select) return null;

  const defaultValue = isString(fieldMetadataItem.defaultValue)
    ? stripSimpleQuotesFromString(fieldMetadataItem.defaultValue)
    : null;

  if (isDefined(defaultValue)) return defaultValue;

  const firstOptionValue = fieldMetadataItem.options?.[0]?.value;

  // If no default value is set, display the first option value.
  return firstOptionValue ?? null;
};
