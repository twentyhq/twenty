import { RecordGqlConnection } from '@/object-record/graphql-operations/types/RecordGqlConnection';

export type RecordGqlFindManyResult = {
  [objectNamePlural: string]: RecordGqlConnection;
};
