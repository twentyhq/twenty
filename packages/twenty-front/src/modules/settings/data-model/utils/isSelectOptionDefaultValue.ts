import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { applySimpleQuotesToString } from '~/utils/string/applySimpleQuotesToString';

export const isSelectOptionDefaultValue = (
  optionValue: string,
  fieldMetadataItem: Pick<FieldMetadataItem, 'defaultValue' | 'type'>,
): boolean => {
  if (fieldMetadataItem.type === FieldMetadataType.Select) {
    return (
      applySimpleQuotesToString(optionValue) === fieldMetadataItem.defaultValue
    );
  }

  if (
    fieldMetadataItem.type === FieldMetadataType.MultiSelect &&
    Array.isArray(fieldMetadataItem.defaultValue)
  ) {
    return fieldMetadataItem.defaultValue.includes(
      applySimpleQuotesToString(optionValue),
    );
  }

  return false;
};
