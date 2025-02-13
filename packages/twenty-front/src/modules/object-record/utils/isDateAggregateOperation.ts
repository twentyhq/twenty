import { DATE_AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/DateAggregateOperations';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';

export const isDateAggregateOperation = (
  aggregateOperation: ExtendedAggregateOperations,
) => {
  return (
    aggregateOperation === DATE_AGGREGATE_OPERATIONS.latest ||
    aggregateOperation === DATE_AGGREGATE_OPERATIONS.earliest
  );
};
