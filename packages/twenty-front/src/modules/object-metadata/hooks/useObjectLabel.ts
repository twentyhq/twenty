import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export const useObjectLabel = (
  objectMetadataItem: EnrichedObjectMetadataItem,
) => {
  return objectMetadataItem?.labelSingular ?? '';
};
