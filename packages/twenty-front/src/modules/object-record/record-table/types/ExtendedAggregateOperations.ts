import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';

export type ExtendedAggregateOperations =
  | AggregateOperations
  | DateAggregateOperations;
