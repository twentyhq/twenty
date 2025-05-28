import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';

export const COUNT_AGGREGATE_OPERATION_OPTIONS = [
  AggregateOperations.count,
  AggregateOperations.countEmpty,
  AggregateOperations.countNotEmpty,
  AggregateOperations.countUniqueValues,
  AggregateOperations.countTrue,
  AggregateOperations.countFalse,
];
