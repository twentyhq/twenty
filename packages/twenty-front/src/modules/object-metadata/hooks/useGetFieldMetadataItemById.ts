import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useGetFieldMetadataItemById = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const getFieldMetadataItemById = useCallback(
    (fieldMetadataId: string) => {
      const fieldMetadataItem = objectMetadataItems
        .flatMap((objectMetadataItem) => objectMetadataItem.fields)
        .find((field) => field.id === fieldMetadataId);

      if (!isDefined(fieldMetadataItem)) {
        throw new Error(
          `Field metadata item not found for id ${fieldMetadataId}`,
        );
      }

      return fieldMetadataItem;
    },
    [objectMetadataItems],
  );

  return { getFieldMetadataItemById };
};
