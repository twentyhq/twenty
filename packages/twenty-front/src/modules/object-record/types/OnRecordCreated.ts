import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type OnRecordCreated = (args: {
  record: ObjectRecord;
  recordInput?: Partial<ObjectRecord>;
}) => void;
