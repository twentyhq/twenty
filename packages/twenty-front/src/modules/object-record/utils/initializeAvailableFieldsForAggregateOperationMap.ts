import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { AvailableFieldsForAggregateOperation } from '@/object-record/types/AvailableFieldsForAggregateOperation';

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
