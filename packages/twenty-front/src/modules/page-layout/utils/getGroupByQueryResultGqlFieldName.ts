import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const getGroupByQueryResultGqlFieldName = (
  objectMetadataItem: ObjectMetadataItem,
): string => {
  return `${objectMetadataItem.namePlural}GroupBy`;
};
