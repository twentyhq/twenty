import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';

export const useObjectMetadataItemsThatCanHavePermission = () => {
  const { activeObjectMetadataItems: objectMetadataItems } =
    useFilteredObjectMetadataItems();

  const objectMetadataItemsThatCanHavePermission = objectMetadataItems.filter(
    (objectMetadataItem) => objectMetadataItem.isUIEditable,
  );

  return {
    objectMetadataItemsThatCanHavePermission,
  };
};
