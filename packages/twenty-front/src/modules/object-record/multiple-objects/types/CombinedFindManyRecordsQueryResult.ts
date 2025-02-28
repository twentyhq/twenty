import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';

export type CombinedFindManyRecordsQueryResult = {
  [namePlural: string]: RecordGqlConnection;
};
