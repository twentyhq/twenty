import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';

export const COUNT_AGGREGATE_OPERATION_OPTIONS = [
  AggregateOperations.COUNT,
  AggregateOperations.COUNT_EMPTY,
  AggregateOperations.COUNT_NOT_EMPTY,
  AggregateOperations.COUNT_UNIQUE_VALUES,
  AggregateOperations.COUNT_TRUE,
  AggregateOperations.COUNT_FALSE,
];
