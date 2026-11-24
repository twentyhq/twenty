import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';

export const useObjectMetadataItemsThatCanHavePermission = ({
  shouldIncludeSystemObjects = false,
}: { shouldIncludeSystemObjects?: boolean } = {}) => {
  const {
    activeObjectMetadataItems,
    alphaSortedActiveNonSystemObjectMetadataItems,
  } = useFilteredObjectMetadataItems();

  const objectMetadataItems = shouldIncludeSystemObjects
    ? activeObjectMetadataItems
    : alphaSortedActiveNonSystemObjectMetadataItems;

  const objectMetadataItemsThatCanHavePermission = objectMetadataItems.filter(
    (objectMetadataItem) => objectMetadataItem.isUIEditable,
  );

  return {
    objectMetadataItemsThatCanHavePermission,
  };
};
