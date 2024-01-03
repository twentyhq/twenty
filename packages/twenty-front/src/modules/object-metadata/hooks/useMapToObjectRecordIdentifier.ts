import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';

export const useMapToObjectRecordIdentifier = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  return (record: any): ObjectRecordIdentifier => {
    return getObjectRecordIdentifier({
      objectMetadataItem,
      record,
    });
  };
};
