import { CachedObjectRecordEdge } from '@/apollo/types/CachedObjectRecordEdge';
import { RecordGqlConnection } from '@/object-record/graphql-operations/types/RecordGqlConnection';

export type CachedObjectRecordConnection = Omit<
  RecordGqlConnection,
  'edges'
> & {
  edges: CachedObjectRecordEdge[];
};
