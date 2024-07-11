import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';

export type RecordGqlOperationFindDuplicatesResult = {
  [objectNamePlural: string]: RecordGqlConnection[];
};
