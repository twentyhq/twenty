import { RecordGqlNode } from '@/object-record/graphql-operations/types/RecordGqlNode';

export type RecordGqlFindOneResult = {
  [objectNamePlural: string]: RecordGqlNode;
};
