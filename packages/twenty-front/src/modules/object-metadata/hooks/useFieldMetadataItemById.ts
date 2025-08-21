import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { useRecoilValue } from 'recoil';

export const useFieldMetadataItemById = (fieldMetadataId: string) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  return getFieldMetadataItemById({
    fieldMetadataId,
    objectMetadataItems,
  });
};
