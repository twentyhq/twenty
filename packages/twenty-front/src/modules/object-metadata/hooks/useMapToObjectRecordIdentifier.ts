import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';

export const useMapToObjectRecordIdentifier = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}): ((record: ObjectRecord) => ObjectRecordIdentifier) => {
  return (record: ObjectRecord) =>
    getObjectRecordIdentifier({
      objectMetadataItem,
      record,
    });
};
