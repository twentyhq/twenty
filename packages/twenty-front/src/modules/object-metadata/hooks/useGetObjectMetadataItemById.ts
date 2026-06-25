import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CustomError, isDefined } from 'twenty-shared/utils';

export const useGetObjectMetadataItemById = () => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

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
