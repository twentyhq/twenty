import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';

export const isActiveFieldMetadataItem = (
  fieldMetadata: Pick<FieldMetadataItem, 'name' | 'isSystem' | 'isActive'>,
) => {
  if (fieldMetadata.isActive === false) {
    return false;
  }

  if (isHiddenSystemField(fieldMetadata)) {
    return false;
  }

  return true;
};
