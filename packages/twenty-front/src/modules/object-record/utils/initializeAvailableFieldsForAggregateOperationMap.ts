import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { AvailableFieldsForAggregateOperation } from '@/object-record/types/AvailableFieldsForAggregateOperation';

export const initializeAvailableFieldsForAggregateOperationMap = (
  aggregateOperations: AGGREGATE_OPERATIONS[],
): AvailableFieldsForAggregateOperation => {
  return aggregateOperations.reduce(
    (acc, operation) => ({
      ...acc,
      [operation]: [],
    }),
    {},
  );
};
