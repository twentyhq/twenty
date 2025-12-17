import { type RecordGqlConnectionEdgesRequired } from '@/object-record/graphql/types/RecordGqlConnectionEdgesRequired';

export type RecordGqlOperationSearchResult = {
  [objectNamePlural: string]: RecordGqlConnectionEdgesRequired;
};
