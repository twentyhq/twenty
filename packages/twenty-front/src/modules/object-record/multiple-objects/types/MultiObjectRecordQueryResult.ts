import { RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';

export type MultiObjectRecordQueryResult = {
  [namePlural: string]: RecordGqlConnection;
};
