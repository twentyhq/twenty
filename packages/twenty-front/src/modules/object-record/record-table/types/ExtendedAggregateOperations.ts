import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/DateAggregateOperations';

export type ExtendedAggregateOperations =
  | AGGREGATE_OPERATIONS
  | DATE_AGGREGATE_OPERATIONS;
