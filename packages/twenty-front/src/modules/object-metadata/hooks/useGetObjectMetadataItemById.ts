import { useRecoilValue } from 'recoil';

import { CustomError } from '@/error-handler/CustomError';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isDefined } from 'twenty-shared/utils';

export const useGetObjectMetadataItemById = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const getObjectMetadataItemById = (objectId: string) => {
    const objectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) => objectMetadataItem.id === objectId,
    );

    if (!isDefined(objectMetadataItem)) {
      throw new CustomError(
        `Object metadata item not found for id ${objectId}`,
        'OBJECT_METADATA_ITEM_NOT_FOUND',
      );
    }

    return objectMetadataItem;
  };

  return {
    getObjectMetadataItemById,
  };
};
