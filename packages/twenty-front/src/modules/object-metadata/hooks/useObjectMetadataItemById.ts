import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CustomError, isDefined } from 'twenty-shared/utils';

export const useObjectMetadataItemById = ({
  objectId,
}: {
  objectId: string;
}) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === objectId,
  );

  if (!isDefined(objectMetadataItem)) {
    throw new CustomError(
      // Error text is used for locale-independent issue grouping.
      // oxlint-disable-next-line lingui/no-unlocalized-strings
      `Object metadata item not found for id ${objectId}`,
      'OBJECT_METADATA_ITEM_NOT_FOUND',
    );
  }

  return {
    objectMetadataItem,
  };
};
