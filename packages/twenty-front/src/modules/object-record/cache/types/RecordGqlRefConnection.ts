import { RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { RecordGqlConnection } from '@/object-record/graphql-operations/types/RecordGqlConnection';

export type RecordGqlRefConnection = Omit<RecordGqlConnection, 'edges'> & {
  edges: RecordGqlRefEdge[];
};
