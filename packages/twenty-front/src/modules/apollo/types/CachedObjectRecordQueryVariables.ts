import { type RecordGqlOperationVariables } from 'twenty-shared/types';

export type CachedObjectRecordQueryVariables = Omit<
  RecordGqlOperationVariables,
  'limit'
> & { first?: RecordGqlOperationVariables['limit'] };
