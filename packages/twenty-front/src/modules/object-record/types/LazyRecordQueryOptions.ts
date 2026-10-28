import { type RecordGqlOperationVariables } from 'twenty-shared/types';

export type LazyRecordQueryOptions = Pick<
  RecordGqlOperationVariables,
  'filter'
>;
