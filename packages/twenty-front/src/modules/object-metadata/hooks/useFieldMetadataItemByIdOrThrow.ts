import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getFieldMetadataItemByIdOrThrow } from '@/object-metadata/utils/getFieldMetadataItemByIdOrThrow';
import { useRecoilValue } from 'recoil';

export const useFieldMetadataItemByIdOrThrow = (fieldMetadataId: string) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  return getFieldMetadataItemByIdOrThrow({
    fieldMetadataId,
    objectMetadataItems,
  });
};
