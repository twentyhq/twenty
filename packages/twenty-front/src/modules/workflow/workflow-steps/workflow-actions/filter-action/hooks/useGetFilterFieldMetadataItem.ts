import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';

export const useGetFilterFieldMetadataItem = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const getFilterFieldMetadataItem = (fieldMetadataId: string) => {
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

  return {
    getFilterFieldMetadataItem,
  };
};
