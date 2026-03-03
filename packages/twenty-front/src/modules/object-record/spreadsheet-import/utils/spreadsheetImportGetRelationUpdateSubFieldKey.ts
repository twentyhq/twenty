import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getRelationUpdateSubFieldKey = (
  fieldMetadataItem: FieldMetadataItem,
  targetField: FieldMetadataItem,
  compositeSubFieldKey?: string,
) => {
  const prefix = 'update:';
  return `${prefix}${isDefined(compositeSubFieldKey) ? `${compositeSubFieldKey}-${targetField.name}` : targetField.name} (${fieldMetadataItem.name})`;
};
