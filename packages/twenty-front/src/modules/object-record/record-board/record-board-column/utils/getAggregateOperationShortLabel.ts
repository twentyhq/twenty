import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/DateAggregateOperations';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';

export const getAggregateOperationShortLabel = (
  operation: ExtendedAggregateOperations,
) => {
  switch (operation) {
    case AGGREGATE_OPERATIONS.min:
      return 'Min';
    case AGGREGATE_OPERATIONS.max:
      return 'Max';
    case AGGREGATE_OPERATIONS.avg:
      return 'Average';
    case AGGREGATE_OPERATIONS.sum:
      return 'Sum';
    case AGGREGATE_OPERATIONS.count:
      return 'All';
    case AGGREGATE_OPERATIONS.countEmpty:
    case AGGREGATE_OPERATIONS.percentageEmpty:
      return 'Empty';
    case AGGREGATE_OPERATIONS.countNotEmpty:
    case AGGREGATE_OPERATIONS.percentageNotEmpty:
      return 'Not empty';
    case AGGREGATE_OPERATIONS.countUniqueValues:
      return 'Unique';
    case DATE_AGGREGATE_OPERATIONS.earliest:
      return 'Earliest';
    case DATE_AGGREGATE_OPERATIONS.latest:
      return 'Latest';
    default:
      throw new Error(`Unknown aggregate operation: ${operation}`);
  }
};
