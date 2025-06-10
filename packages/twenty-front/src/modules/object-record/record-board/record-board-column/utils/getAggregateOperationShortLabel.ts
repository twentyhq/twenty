import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { msg } from '@lingui/core/macro';

export const getAggregateOperationShortLabel = (
  operation: ExtendedAggregateOperations,
) => {
  switch (operation) {
    case AggregateOperations.MIN:
      return msg`Min`;
    case AggregateOperations.MAX:
      return msg`Max`;
    case AggregateOperations.AVG:
      return msg`Average`;
    case AggregateOperations.SUM:
      return msg`Sum`;
    case AggregateOperations.COUNT:
      return msg`All`;
    case AggregateOperations.COUNT_EMPTY:
    case AggregateOperations.PERCENTAGE_EMPTY:
      return msg`Empty`;
    case AggregateOperations.COUNT_NOT_EMPTY:
    case AggregateOperations.PERCENTAGE_NOT_EMPTY:
      return msg`Not empty`;
    case AggregateOperations.COUNT_UNIQUE_VALUES:
      return msg`Unique`;
    case DateAggregateOperations.EARLIEST:
      return msg`Earliest`;
    case DateAggregateOperations.LATEST:
      return msg`Latest`;
    case AggregateOperations.COUNT_TRUE:
      return msg`True`;
    case AggregateOperations.COUNT_FALSE:
      return msg`False`;
    default:
      throw new Error(`Unknown aggregate operation: ${operation}`);
  }
};
