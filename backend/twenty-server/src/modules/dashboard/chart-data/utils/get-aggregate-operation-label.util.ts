import { AggregateOperations } from 'twenty-shared/types';

export const getAggregateOperationLabel = (
  operation: AggregateOperations,
): string => {
  switch (operation) {
    case AggregateOperations.MIN:
      return 'Min';
    case AggregateOperations.MAX:
      return 'Max';
    case AggregateOperations.AVG:
      return 'Average';
    case AggregateOperations.SUM:
      return 'Sum';
    case AggregateOperations.COUNT:
      return 'Count all';
    case AggregateOperations.COUNT_EMPTY:
      return 'Count empty';
    case AggregateOperations.COUNT_NOT_EMPTY:
      return 'Count not empty';
    case AggregateOperations.COUNT_UNIQUE_VALUES:
      return 'Count unique values';
    case AggregateOperations.PERCENTAGE_EMPTY:
      return 'Percent empty';
    case AggregateOperations.PERCENTAGE_NOT_EMPTY:
      return 'Percent not empty';
    case AggregateOperations.COUNT_TRUE:
      return 'Count true';
    case AggregateOperations.COUNT_FALSE:
      return 'Count false';
    default:
      return 'Count';
  }
};
