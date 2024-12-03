import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';

export type AggregateOperationsOmittingCount = Exclude<
  AGGREGATE_OPERATIONS,
  AGGREGATE_OPERATIONS.count
>;
