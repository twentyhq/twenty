import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const getGroupByQueryName = (
  objectMetadataItem: ObjectMetadataItem,
): string => {
  return `${objectMetadataItem.namePlural}GroupBy`;
};
