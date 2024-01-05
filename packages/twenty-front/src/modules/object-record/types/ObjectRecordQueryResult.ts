import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';

export type ObjectRecordQueryResult<T extends ObjectRecord> = {
  [objectNamePlural: string]: ObjectRecordConnection<T>;
};
