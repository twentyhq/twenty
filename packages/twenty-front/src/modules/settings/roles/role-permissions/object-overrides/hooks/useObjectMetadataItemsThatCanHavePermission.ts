import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';

export const useObjectMetadataItemsThatCanHavePermission = ({
  includeSystemObjects = false,
}: { includeSystemObjects?: boolean } = {}) => {
  const {
    activeObjectMetadataItems,
    alphaSortedActiveNonSystemObjectMetadataItems,
  } = useFilteredObjectMetadataItems();

  const objectMetadataItems = includeSystemObjects
    ? activeObjectMetadataItems
    : alphaSortedActiveNonSystemObjectMetadataItems;

  const objectMetadataItemsThatCanHavePermission = objectMetadataItems.filter(
    (objectMetadataItem) => objectMetadataItem.isUIEditable,
  );

  return {
    objectMetadataItemsThatCanHavePermission,
  };
};
