import { useCallback } from 'react';

import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getFieldMetadataItemByIdOrThrow } from '@/object-metadata/utils/getFieldMetadataItemByIdOrThrow';
import { useStore } from 'jotai';

type GetFieldMetadataItemByIdOrThrowResult = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const useGetFieldMetadataItemByIdOrThrow = () => {
  const store = useStore();
  const getFieldMetadataItemByIdOrThrowCallback = useCallback(
    (fieldMetadataId: string): GetFieldMetadataItemByIdOrThrowResult => {
      const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

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
