import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';

export const useGetObjectRecordIdentifierByNameSingular = (
  allowRequestsToTwentyIcons: boolean,
) => {
  const objectMetadataItems = useAtomValue(objectMetadataItemsState);

  return (record: any, objectNameSingular: string): ObjectRecordIdentifier => {
    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.nameSingular === objectNameSingular,
    );

    if (!objectMetadataItem) {
      throw new Error(
        `ObjectMetadataItem not found for objectNameSingular: ${objectNameSingular}`,
      );
    }

    return getObjectRecordIdentifier({
      objectMetadataItem,
      record,
      allowRequestsToTwentyIcons,
    });
  };
};
