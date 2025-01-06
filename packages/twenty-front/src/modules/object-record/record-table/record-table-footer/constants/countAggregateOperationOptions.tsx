import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';

export const COUNT_AGGREGATE_OPERATION_OPTIONS = [
  AGGREGATE_OPERATIONS.count,
  AGGREGATE_OPERATIONS.countEmpty,
  AGGREGATE_OPERATIONS.countNotEmpty,
  AGGREGATE_OPERATIONS.countUniqueValues,
];
