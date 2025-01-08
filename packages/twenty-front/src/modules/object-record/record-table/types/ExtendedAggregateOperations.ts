import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';

export type ExtendedAggregateOperations =
  | AGGREGATE_OPERATIONS
  | 'EARLIEST'
  | 'LATEST';
