import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';

export type AggregateOperationsOmittingStandardOperations = Exclude<
  AggregateOperations,
  | AggregateOperations.count
  | AggregateOperations.countEmpty
  | AggregateOperations.countNotEmpty
  | AggregateOperations.countUniqueValues
  | AggregateOperations.percentageEmpty
  | AggregateOperations.percentageNotEmpty
>;
