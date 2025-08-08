import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { isWorkflowRelatedObjectMetadata } from '@/object-metadata/utils/isWorkflowRelatedObjectMetadata';

export const useObjectMetadataItemsThatCanHavePermission = () => {
  const { alphaSortedActiveNonSystemObjectMetadataItems: objectMetadataItems } =
    useFilteredObjectMetadataItems();

  const objectMetadataItemsThatCanHavePermission = objectMetadataItems.filter(
    (objectMetadataItem) =>
      !isWorkflowRelatedObjectMetadata(objectMetadataItem.nameSingular),
  );

  return {
    objectMetadataItemsThatCanHavePermission,
  };
};
