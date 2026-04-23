import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { type AvailableFieldsForAggregateOperation } from '@/object-record/types/AvailableFieldsForAggregateOperation';

export const initializeAvailableFieldsForAggregateOperationMap = (
  aggregateOperations: ExtendedAggregateOperations[],
): AvailableFieldsForAggregateOperation => {
  return aggregateOperations.reduce(
    (acc, operation) => ({
      ...acc,
      [operation]: [],
    }),
    {},
  );
};
