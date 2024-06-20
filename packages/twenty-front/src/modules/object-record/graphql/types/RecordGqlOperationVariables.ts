import { RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';

export type RecordGqlOperationVariables = {
  filter?: RecordGqlOperationFilter;
  orderBy?: RecordGqlOperationOrderBy;
  limit?: number;
};
