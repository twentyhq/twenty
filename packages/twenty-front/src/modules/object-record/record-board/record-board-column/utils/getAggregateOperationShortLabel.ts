import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/DateAggregateOperations';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { msg } from '@lingui/core/macro';

export const getAggregateOperationShortLabel = (
  operation: ExtendedAggregateOperations,
) => {
  switch (operation) {
    case AGGREGATE_OPERATIONS.min:
      return msg`Min`;
    case AGGREGATE_OPERATIONS.max:
      return msg`Max`;
    case AGGREGATE_OPERATIONS.avg:
      return msg`Average`;
    case AGGREGATE_OPERATIONS.sum:
      return msg`Sum`;
    case AGGREGATE_OPERATIONS.count:
      return msg`All`;
    case AGGREGATE_OPERATIONS.countEmpty:
    case AGGREGATE_OPERATIONS.percentageEmpty:
      return msg`Empty`;
    case AGGREGATE_OPERATIONS.countNotEmpty:
    case AGGREGATE_OPERATIONS.percentageNotEmpty:
      return msg`Not empty`;
    case AGGREGATE_OPERATIONS.countUniqueValues:
      return msg`Unique`;
    case DATE_AGGREGATE_OPERATIONS.earliest:
      return msg`Earliest`;
    case DATE_AGGREGATE_OPERATIONS.latest:
      return msg`Latest`;
    default:
      throw new Error(`Unknown aggregate operation: ${operation}`);
  }
};
