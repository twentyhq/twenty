import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/DateAggregateOperations';

import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';

export const convertExtendedAggregateOperationToAggregateOperation = (
  extendedAggregateOperation: ExtendedAggregateOperations | null,
) => {
  if (extendedAggregateOperation === DATE_AGGREGATE_OPERATIONS.earliest) {
    return AGGREGATE_OPERATIONS.min;
  }
  if (extendedAggregateOperation === DATE_AGGREGATE_OPERATIONS.latest) {
    return AGGREGATE_OPERATIONS.max;
  }
  return extendedAggregateOperation;
};
