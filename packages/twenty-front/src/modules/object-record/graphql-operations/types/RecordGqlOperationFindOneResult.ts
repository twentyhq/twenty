import { RecordGqlNode } from '@/object-record/graphql-operations/types/RecordGqlNode';

export type RecordGqlOperationFindOneResult = {
  [objectNameSingular: string]: RecordGqlNode;
};
