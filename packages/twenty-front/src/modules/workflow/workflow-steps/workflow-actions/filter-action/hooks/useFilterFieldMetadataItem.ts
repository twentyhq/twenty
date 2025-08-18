import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';

export const useFilterFieldMetadataItem = (fieldMetadataId: string) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find((objectMetadataItem) =>
    objectMetadataItem.fields.some((field) => field.id === fieldMetadataId),
  );

  const fieldMetadataItem = objectMetadataItem?.fields.find(
    (field) => field.id === fieldMetadataId,
  );

  return {
    objectMetadataItem,
    fieldMetadataItem,
  };
};
