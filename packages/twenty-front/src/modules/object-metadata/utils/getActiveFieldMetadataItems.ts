import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const getActiveFieldMetadataItems = (
  objectMetadataItem: Pick<ObjectMetadataItem, 'readableFields'>,
) =>
  objectMetadataItem.readableFields.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.isActive && !fieldMetadataItem.isSystem,
  );
