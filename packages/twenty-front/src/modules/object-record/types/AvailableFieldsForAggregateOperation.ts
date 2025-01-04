import { AggregateOperationsOmittingStandardOperations } from '@/object-record/types/AggregateOperationsOmittingStandardOperations';

export type AvailableFieldsForAggregateOperation = {
  [T in AggregateOperationsOmittingStandardOperations]?: string[];
};
