import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';

export type RecordForSelect = ObjectRecordIdentifier & {
  record: ObjectRecord;
};
