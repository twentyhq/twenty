import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';

export type AggregateOperationsOmittingStandardOperations = Exclude<
  AggregateOperations,
  | AggregateOperations.COUNT
  | AggregateOperations.COUNT_EMPTY
  | AggregateOperations.COUNT_NOT_EMPTY
  | AggregateOperations.COUNT_UNIQUE_VALUES
  | AggregateOperations.PERCENTAGE_EMPTY
  | AggregateOperations.PERCENTAGE_NOT_EMPTY
>;
