import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';

export type AvailableFieldsForAggregateOperation = {
  [T in AGGREGATE_OPERATIONS]?: string[];
};
