import { RecordGqlNode } from '@/object-record/graphql-operations/types/RecordGqlNode';

export type RecordGqlEdge = {
  __typename: string;
  node: RecordGqlNode;
  cursor: string;
};
