import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';

export type AggregateOperationsOmittingStandardOperations = Exclude<
  AGGREGATE_OPERATIONS,
  | AGGREGATE_OPERATIONS.count
  | AGGREGATE_OPERATIONS.countEmpty
  | AGGREGATE_OPERATIONS.countNotEmpty
  | AGGREGATE_OPERATIONS.countUniqueValues
  | AGGREGATE_OPERATIONS.percentageEmpty
  | AGGREGATE_OPERATIONS.percentageNotEmpty
>;
