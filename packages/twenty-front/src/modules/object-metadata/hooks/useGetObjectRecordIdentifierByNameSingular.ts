import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';

export const useGetObjectRecordIdentifierByNameSingular = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

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
    });
  };
};
