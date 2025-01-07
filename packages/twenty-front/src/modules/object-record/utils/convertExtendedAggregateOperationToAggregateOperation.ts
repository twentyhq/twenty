import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';

import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';

export const convertExtendedAggregateOperationToAggregateOperation = (
  extendedAggregateOperation: ExtendedAggregateOperations,
) => {
  if (extendedAggregateOperation === 'EARLIEST') {
    return AGGREGATE_OPERATIONS.min;
  }
  if (extendedAggregateOperation === 'LATEST') {
    return AGGREGATE_OPERATIONS.max;
  }
  return extendedAggregateOperation;
};
