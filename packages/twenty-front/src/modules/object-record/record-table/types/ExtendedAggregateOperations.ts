import { type DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { type AggregateOperations } from '~/generated/graphql';

export type ExtendedAggregateOperations =
  | AggregateOperations
  | DateAggregateOperations;
