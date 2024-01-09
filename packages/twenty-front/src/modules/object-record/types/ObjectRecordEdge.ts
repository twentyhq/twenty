import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export type ObjectRecordEdge = {
  node: ObjectRecord;
  cursor: string;
};
