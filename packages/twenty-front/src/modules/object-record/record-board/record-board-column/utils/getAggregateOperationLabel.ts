import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';

export const getAggregateOperationLabel = (operation: AGGREGATE_OPERATIONS) => {
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
      return 'Count';
    default:
      throw new Error(`Unknown aggregate operation: ${operation}`);
  }
};
