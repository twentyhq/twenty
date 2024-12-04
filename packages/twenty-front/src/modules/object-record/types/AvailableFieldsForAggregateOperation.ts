import { AggregateOperationsOmittingCount } from '@/object-record/types/AggregateOperationsOmittingCount';

export type AvailableFieldsForAggregateOperation = {
  [T in AggregateOperationsOmittingCount]?: string[];
};
