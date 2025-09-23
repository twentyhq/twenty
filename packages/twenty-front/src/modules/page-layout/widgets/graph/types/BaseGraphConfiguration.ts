import { type RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';

export type BaseGraphConfiguration = {
  filter?: RecordGqlOperationFilter;
  aggregateOperation: AggregateOperations;
  aggregateFieldMetadataId: string;
  description?: string;
  color?: string;
};
