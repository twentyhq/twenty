import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { applyQuotesToString } from '@/object-metadata/utils/applyQuotesToString';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const isSelectOptionDefaultValue = (
  optionValue: string,
  fieldMetadataItem: Pick<FieldMetadataItem, 'defaultValue' | 'type'>,
): boolean => {
  if (fieldMetadataItem.type === FieldMetadataType.Select) {
    return applyQuotesToString(optionValue) === fieldMetadataItem.defaultValue;
  }

  if (fieldMetadataItem.type === FieldMetadataType.MultiSelect) {
    return fieldMetadataItem.defaultValue.includes(
      applyQuotesToString(optionValue),
    );
  }

  return false;
};
