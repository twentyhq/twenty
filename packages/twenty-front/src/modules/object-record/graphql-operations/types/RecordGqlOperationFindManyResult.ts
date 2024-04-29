import { RecordGqlConnection } from '@/object-record/graphql-operations/types/RecordGqlConnection';

export type RecordGqlOperationFindManyResult = {
  [objectNamePlural: string]: RecordGqlConnection;
};
