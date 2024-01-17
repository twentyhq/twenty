import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useMapToObjectRecordIdentifier =
  ({ objectMetadataItem }: { objectMetadataItem: ObjectMetadataItem }) =>
  (record: ObjectRecord) =>
    getObjectRecordIdentifier({ objectMetadataItem, record });
