import { type RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';

export type CachedObjectRecordQueryVariables = Omit<
  RecordGqlOperationVariables,
  'limit'
> & { first?: RecordGqlOperationVariables['limit'] };
