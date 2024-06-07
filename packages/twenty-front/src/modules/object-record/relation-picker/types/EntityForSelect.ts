import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';

export type EntityForSelect = ObjectRecordIdentifier & {
  record: ObjectRecord;
};
