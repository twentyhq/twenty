import { type AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';

export type ExtendedAggregateOperations =
  | AggregateOperations
  | DateAggregateOperations;
