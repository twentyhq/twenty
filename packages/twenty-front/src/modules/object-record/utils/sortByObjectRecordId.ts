import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const sortByObjectRecordId = (a: ObjectRecord, b: ObjectRecord) => {
  return a.id.localeCompare(b.id);
};
