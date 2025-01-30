import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilValue } from 'recoil';

export const useGetFieldMetadataItemById = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const getFieldMetadataItemById = (fieldMetadataId: string) => {
    const correspondingObjectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.fields.some((field) => field.id === fieldMetadataId),
    );

    const fieldMetadataItem = correspondingObjectMetadataItem?.fields.find(
      (field) => field.id === fieldMetadataId,
    );

    return fieldMetadataItem;
  };

  return { getFieldMetadataItemById };
};
