import { type RecordGqlRefNode } from '@/object-record/cache/types/RecordGqlRefNode';
import { type RecordGqlEdge } from '@/object-record/graphql/types/RecordGqlEdge';

export type RecordGqlRefEdge = Omit<RecordGqlEdge, 'node'> & {
  node: RecordGqlRefNode;
};
