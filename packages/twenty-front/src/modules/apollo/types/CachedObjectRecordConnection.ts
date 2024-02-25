import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';

export type CachedObjectRecordConnection = Omit<
  ObjectRecordConnection,
  'edges'
> & {
  edges: CachedObjectRecordEdge[];
};
