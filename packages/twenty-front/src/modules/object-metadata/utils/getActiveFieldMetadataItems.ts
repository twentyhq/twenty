import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const getActiveFieldMetadataItems = (
  objectMetadataItem: Pick<ObjectMetadataItem, 'fields'>,
) =>
  objectMetadataItem.fields.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.isActive && !fieldMetadataItem.isSystem,
  );
