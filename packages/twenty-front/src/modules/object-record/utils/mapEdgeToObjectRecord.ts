import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ObjectRecordEdge } from '@/object-record/types/ObjectRecordEdge';

export const mapEdgeToObjectRecord = <T extends ObjectRecord>(
  objectRecordEdge: ObjectRecordEdge<T>,
) => {
  return objectRecordEdge.node as T;
};
