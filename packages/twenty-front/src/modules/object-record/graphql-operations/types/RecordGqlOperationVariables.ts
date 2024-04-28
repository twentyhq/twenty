import { RecordGqlOperationFilter } from '@/object-record/graphql-operations/types/RecordGqlOperationFilter';
import { RecordGqlOperationOrderBy } from '@/object-record/graphql-operations/types/RecordGqlOperationOrderBy';

export type RecordGqlOperationVariables = {
  filter?: RecordGqlOperationFilter;
  orderBy?: RecordGqlOperationOrderBy;
  limit?: number;
};
