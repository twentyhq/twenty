import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';

export type ObjectRecordForSelect = {
  objectMetadataItem: ObjectMetadataItem;
  record: ObjectRecord;
  recordIdentifier: ObjectRecordIdentifier;
};
