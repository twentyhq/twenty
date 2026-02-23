import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { CustomError, isDefined } from 'twenty-shared/utils';

export const useObjectMetadataItemById = ({
  objectId,
}: {
  objectId: string;
}) => {
  const objectMetadataItems = useRecoilValueV2(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === objectId,
  );

  if (!isDefined(objectMetadataItem)) {
    throw new CustomError(
      `Object metadata item not found for id ${objectId}`,
      'OBJECT_METADATA_ITEM_NOT_FOUND',
    );
  }

  return {
    objectMetadataItem,
  };
};
