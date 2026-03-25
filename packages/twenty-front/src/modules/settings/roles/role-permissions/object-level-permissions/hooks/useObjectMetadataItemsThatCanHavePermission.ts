import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';

export const useObjectMetadataItemsThatCanHavePermission = () => {
  const { alphaSortedActiveNonSystemObjectMetadataItems: objectMetadataItems } =
    useFilteredObjectMetadataItems();

  const objectMetadataItemsThatCanHavePermission = objectMetadataItems.filter(
    (objectMetadataItem) => !objectMetadataItem.isUIReadOnly,
  );

  return {
    objectMetadataItemsThatCanHavePermission,
  };
};
