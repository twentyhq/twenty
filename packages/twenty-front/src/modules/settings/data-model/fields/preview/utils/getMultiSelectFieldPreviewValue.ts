import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

export const getMultiSelectFieldPreviewValue = ({
  fieldMetadataItem,
}: {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'type' | 'defaultValue' | 'options'
  >;
}) => {
  if (fieldMetadataItem.type !== FieldMetadataType.MultiSelect) return null;

  const defaultValues = Array.isArray(fieldMetadataItem.defaultValue)
    ? fieldMetadataItem.defaultValue?.map((defaultValue: `'${string}'`) =>
        stripSimpleQuotesFromString(defaultValue),
      )
    : null;

  if (isDefined(defaultValues) && defaultValues?.length > 0)
    return defaultValues;

  const allOptionValues = fieldMetadataItem.options?.map(({ value }) => value);

  // If no default value is set, display all options.
  return allOptionValues ?? null;
};
