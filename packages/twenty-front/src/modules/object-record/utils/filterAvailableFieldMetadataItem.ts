import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { parseFieldRelationType } from '@/object-metadata/utils/parseFieldRelationType';

export const filterAvailableFieldMetadataItem = (
  fieldMetadataItem: FieldMetadataItem,
): boolean => {
  if (fieldMetadataItem.type === 'RELATION') {
    const fieldMetadataItemRelationType =
      parseFieldRelationType(fieldMetadataItem);

    if (fieldMetadataItemRelationType !== 'TO_ONE_OBJECT') {
      return false;
    }
  }

  if (fieldMetadataItem.type === 'UUID') {
    return false;
  }

  if (fieldMetadataItem.isSystem) {
    return false;
  }

  return true;
};
