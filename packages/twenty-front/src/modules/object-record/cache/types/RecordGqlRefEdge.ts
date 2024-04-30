import { RecordGqlRefNode } from '@/object-record/cache/types/RecordGqlRefNode';
import { RecordGqlEdge } from '@/object-record/graphql/types/RecordGqlEdge';

export type RecordGqlRefEdge = Omit<RecordGqlEdge, 'node'> & {
  node: RecordGqlRefNode;
};
