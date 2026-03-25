import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getRelationConnectSubFieldKey = (
  fieldMetadataItem: FieldMetadataItem,
  uniqueConstraintField: FieldMetadataItem,
  compositeSubFieldKey?: string,
) => {
  return `${isDefined(compositeSubFieldKey) ? `${compositeSubFieldKey}-${uniqueConstraintField.name}` : uniqueConstraintField.name} (${fieldMetadataItem.name})`;
};
