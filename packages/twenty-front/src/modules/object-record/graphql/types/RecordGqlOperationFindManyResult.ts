import { type RecordGqlConnectionEdgesRequired } from '@/object-record/graphql/types/RecordGqlConnectionEdgesRequired';

export type RecordGqlOperationFindManyResult = {
  [objectNamePlural: string]: RecordGqlConnectionEdgesRequired;
};
