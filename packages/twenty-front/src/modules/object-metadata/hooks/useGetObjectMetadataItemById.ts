import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { CustomError, isDefined } from 'twenty-shared/utils';

export const useGetObjectMetadataItemById = () => {
  const objectMetadataItems = useAtomValue(objectMetadataItemsState);

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
