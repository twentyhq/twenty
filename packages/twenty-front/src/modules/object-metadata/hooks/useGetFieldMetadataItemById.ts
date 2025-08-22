import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getFieldMetadataItemByIdOrThrow } from '@/object-metadata/utils/getFieldMetadataItemByIdOrThrow';
import { useRecoilCallback } from 'recoil';

type GetFieldMetadataItemByIdOrThrowResult = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: ObjectMetadataItem;
};

export const useGetFieldMetadataItemByIdOrThrow = () => {
  const getFieldMetadataItemById = useRecoilCallback(
    ({ snapshot }) =>
      (fieldMetadataId: string): GetFieldMetadataItemByIdOrThrowResult => {
        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .getValue();

        return getFieldMetadataItemByIdOrThrow({
          fieldMetadataId,
          objectMetadataItems,
        });
      },
    [],
  );

  return { getFieldMetadataItemByIdOrThrow: getFieldMetadataItemById };
};
