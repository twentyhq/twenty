import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const getDisabledFieldMetadataItems = (
  objectMetadataItem: Pick<ObjectMetadataItem, 'fields'>,
) =>
  objectMetadataItem.fields.filter(
    (fieldMetadataItem) =>
      !fieldMetadataItem.isActive && !fieldMetadataItem.isSystem,
  );
