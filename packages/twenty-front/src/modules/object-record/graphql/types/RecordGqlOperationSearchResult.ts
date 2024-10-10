import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';

export type RecordGqlOperationSearchResult = {
  [objectNamePlural: string]: RecordGqlConnection;
};
