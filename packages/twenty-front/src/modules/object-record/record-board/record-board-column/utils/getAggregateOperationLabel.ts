import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/DateAggregateOperations';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { t } from '@lingui/core/macro';

export const getAggregateOperationLabel = (
  operation: ExtendedAggregateOperations,
) => {
  switch (operation) {
    case AGGREGATE_OPERATIONS.min:
      return t`Min`;
    case AGGREGATE_OPERATIONS.max:
      return t`Max`;
    case AGGREGATE_OPERATIONS.avg:
      return t`Average`;
    case AGGREGATE_OPERATIONS.sum:
      return t`Sum`;
    case AGGREGATE_OPERATIONS.count:
      return t`Count all`;
    case AGGREGATE_OPERATIONS.countEmpty:
      return t`Count empty`;
    case AGGREGATE_OPERATIONS.countNotEmpty:
      return t`Count not empty`;
    case AGGREGATE_OPERATIONS.countUniqueValues:
      return t`Count unique values`;
    case AGGREGATE_OPERATIONS.percentageEmpty:
      return t`Percent empty`;
    case AGGREGATE_OPERATIONS.percentageNotEmpty:
      return t`Percent not empty`;
    case DATE_AGGREGATE_OPERATIONS.earliest:
      return t`Earliest date`;
    case DATE_AGGREGATE_OPERATIONS.latest:
      return t`Latest date`;
    default:
      throw new Error(`Unknown aggregate operation: ${operation}`);
  }
};
