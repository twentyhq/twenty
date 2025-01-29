import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/DateAggregateOperations';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { msg } from '@lingui/core/macro';

export const getAggregateOperationLabel = (
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
      return msg`Count all`;
    case AGGREGATE_OPERATIONS.countEmpty:
      return msg`Count empty`;
    case AGGREGATE_OPERATIONS.countNotEmpty:
      return msg`Count not empty`;
    case AGGREGATE_OPERATIONS.countUniqueValues:
      return msg`Count unique values`;
    case AGGREGATE_OPERATIONS.percentageEmpty:
      return msg`Percent empty`;
    case AGGREGATE_OPERATIONS.percentageNotEmpty:
      return msg`Percent not empty`;
    case DATE_AGGREGATE_OPERATIONS.earliest:
      return msg`Earliest date`;
    case DATE_AGGREGATE_OPERATIONS.latest:
      return msg`Latest date`;
    default:
      throw new Error(`Unknown aggregate operation: ${operation}`);
  }
};
