import { type RecordGqlConnectionEdgesRequired } from '@/object-record/graphql/types/RecordGqlConnectionEdgesRequired';

export type CombinedFindManyRecordsQueryResult = {
  [namePlural: string]: RecordGqlConnectionEdgesRequired;
};
