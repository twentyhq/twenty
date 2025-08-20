import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';

export type SingleRecordPickerRecord = ObjectRecordIdentifier & {
  record: ObjectRecord;
};
