import { AgreggateOperationsOmittingCount } from '@/object-record/types/AggregateOperationsOmittingCount';

export type AvailableFieldsForAggregateOperation = {
  [T in AgreggateOperationsOmittingCount]?: string[];
};
