import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const useObjectLabel = (objectMetadataItem: ObjectMetadataItem) => {
  return objectMetadataItem?.labelSingular ?? '';
};
