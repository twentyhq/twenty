import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export type ObjectRecordEdge<T extends ObjectRecord = ObjectRecord> = {
  __typename?: string;
  node: T;
  cursor: string;
};
