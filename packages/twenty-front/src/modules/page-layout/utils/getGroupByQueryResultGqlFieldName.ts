import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export const getGroupByQueryResultGqlFieldName = (
  objectMetadataItem: EnrichedObjectMetadataItem,
): string => {
  return `${objectMetadataItem.namePlural}GroupBy`;
};
