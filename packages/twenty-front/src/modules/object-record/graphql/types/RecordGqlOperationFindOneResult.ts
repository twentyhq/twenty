import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';

export type RecordGqlOperationFindOneResult = {
  [objectNameSingular: string]: RecordGqlNode;
};
