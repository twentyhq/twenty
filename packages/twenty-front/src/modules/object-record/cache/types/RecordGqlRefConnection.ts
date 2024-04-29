import { RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';

export type RecordGqlRefConnection = Omit<RecordGqlConnection, 'edges'> & {
  edges: RecordGqlRefEdge[];
};
