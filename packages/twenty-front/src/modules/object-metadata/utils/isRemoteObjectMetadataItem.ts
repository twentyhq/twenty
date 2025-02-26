import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const isRemoteObjectMetadataItem = (
  objectMetadataItem: ObjectMetadataItem,
) => objectMetadataItem.isRemote;
