import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const isObjectMetadataReadOnly = (
  objectMetadataItem: Pick<ObjectMetadataItem, 'isRemote' | 'isUIReadOnly'>,
) => objectMetadataItem.isRemote || objectMetadataItem.isUIReadOnly;
