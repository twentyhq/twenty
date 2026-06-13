import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export const getObjectMetadataItemByUniversalIdentifier = ({
  objectMetadataItems,
  objectUniversalIdentifier,
}: {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectUniversalIdentifier: string;
}): EnrichedObjectMetadataItem | undefined => {
  return objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.universalIdentifier === objectUniversalIdentifier,
  );
};
