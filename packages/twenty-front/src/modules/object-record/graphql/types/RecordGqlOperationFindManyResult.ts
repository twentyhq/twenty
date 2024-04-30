import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';

export type RecordGqlOperationFindManyResult = {
  [objectNamePlural: string]: RecordGqlConnection;
};
