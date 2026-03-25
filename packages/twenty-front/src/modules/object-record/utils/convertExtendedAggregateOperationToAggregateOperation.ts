import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';

import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';

export const convertExtendedAggregateOperationToAggregateOperation = (
  extendedAggregateOperation: ExtendedAggregateOperations,
) => {
  if (extendedAggregateOperation === DateAggregateOperations.EARLIEST) {
    return AggregateOperations.MIN;
  }
  if (extendedAggregateOperation === DateAggregateOperations.LATEST) {
    return AggregateOperations.MAX;
  }
  return extendedAggregateOperation;
};
