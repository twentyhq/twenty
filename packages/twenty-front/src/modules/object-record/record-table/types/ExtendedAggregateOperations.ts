import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';

export type ExtendedAggregateOperations =
  | AggregateOperations
  | DATE_AggregateOperations;
