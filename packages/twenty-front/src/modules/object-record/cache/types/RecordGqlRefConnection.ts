import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { type RecordGqlConnectionEdgesRequired } from '@/object-record/graphql/types/RecordGqlConnectionEdgesRequired';

export type RecordGqlRefConnection = Omit<
  RecordGqlConnectionEdgesRequired,
  'edges'
> & {
  edges: RecordGqlRefEdge[];
};
