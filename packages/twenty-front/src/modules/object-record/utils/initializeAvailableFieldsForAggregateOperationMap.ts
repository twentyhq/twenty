import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { AvailableFieldsForAggregateOperation } from '@/object-record/types/AvailableFieldsForAggregateOperation';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';

export const initializeAvailableFieldsForAggregateOperationMap = (
  aggregateOperations: AGGREGATE_OPERATIONS[],
): AvailableFieldsForAggregateOperation => {
  return aggregateOperations.reduce(
    (acc, operation) => ({
      ...acc,
      [convertAggregateOperationToExtendedAggregateOperation(operation)]: [],
    }),
    {},
  );
};
