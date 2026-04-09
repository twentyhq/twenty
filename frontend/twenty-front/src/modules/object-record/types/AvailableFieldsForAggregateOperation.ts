import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';

export type AvailableFieldsForAggregateOperation = {
  [T in ExtendedAggregateOperations]?: string[];
};
