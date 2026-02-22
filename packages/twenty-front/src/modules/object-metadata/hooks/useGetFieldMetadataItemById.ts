import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
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
    () =>
      (fieldMetadataId: string): GetFieldMetadataItemByIdOrThrowResult => {
        const objectMetadataItems = jotaiStore.get(
          objectMetadataItemsState.atom,
        );

        return getFieldMetadataItemByIdOrThrow({
          fieldMetadataId,
          objectMetadataItems,
        });
      },
    [],
  );

  return { getFieldMetadataItemByIdOrThrow: getFieldMetadataItemById };
};
