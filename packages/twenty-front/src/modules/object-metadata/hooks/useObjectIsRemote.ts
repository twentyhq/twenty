import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useObjectIsRemote = (objectMetadataItem: ObjectMetadataItem) => {
  return objectMetadataItem.isRemote ?? false;
};
