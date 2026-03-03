import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';

export const getActiveFieldMetadataItems = (
  objectMetadataItem: Pick<ObjectMetadataItem, 'readableFields'>,
) =>
  objectMetadataItem.readableFields.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.isActive && !isHiddenSystemField(fieldMetadataItem),
  );
