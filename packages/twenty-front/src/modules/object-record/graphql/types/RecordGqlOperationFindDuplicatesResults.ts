import { type RecordGqlConnectionEdgesRequired } from '@/object-record/graphql/types/RecordGqlConnectionEdgesRequired';

export type RecordGqlOperationFindDuplicatesResult = {
  [objectNamePlural: string]: RecordGqlConnectionEdgesRequired[];
};
