import { useCallback } from 'react';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getFieldMetadataItemByIdOrThrow } from '@/object-metadata/utils/getFieldMetadataItemByIdOrThrow';
import { useStore } from 'jotai';

type GetFieldMetadataItemByIdOrThrowResult = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: ObjectMetadataItem;
};

export const useGetFieldMetadataItemByIdOrThrow = () => {
  const store = useStore();
  const getFieldMetadataItemByIdOrThrowCallback = useCallback(
    (fieldMetadataId: string): GetFieldMetadataItemByIdOrThrowResult => {
      const objectMetadataItems = store.get(objectMetadataItemsState.atom);

      return getFieldMetadataItemByIdOrThrow({
        fieldMetadataId,
        objectMetadataItems,
      });
    },
    [store],
  );

  return {
    getFieldMetadataItemByIdOrThrow: getFieldMetadataItemByIdOrThrowCallback,
  };
};
