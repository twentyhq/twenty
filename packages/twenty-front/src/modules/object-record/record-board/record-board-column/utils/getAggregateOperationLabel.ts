import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { t } from '@lingui/core/macro';
import { CustomError } from 'twenty-shared/utils';

export const getAggregateOperationLabel = (
  operation: ExtendedAggregateOperations,
) => {
  switch (operation) {
    case AggregateOperations.MIN:
      return t`Min`;
    case AggregateOperations.MAX:
      return t`Max`;
    case AggregateOperations.AVG:
      return t`Average`;
    case AggregateOperations.SUM:
      return t`Sum`;
    case AggregateOperations.COUNT:
      return t`Count all`;
    case AggregateOperations.COUNT_EMPTY:
      return t`Count empty`;
    case AggregateOperations.COUNT_NOT_EMPTY:
      return t`Count not empty`;
    case AggregateOperations.COUNT_UNIQUE_VALUES:
      return t`Count unique values`;
    case AggregateOperations.PERCENTAGE_EMPTY:
      return t`Percent empty`;
    case AggregateOperations.PERCENTAGE_NOT_EMPTY:
      return t`Percent not empty`;
    case DateAggregateOperations.EARLIEST:
      return t`Earliest date`;
    case DateAggregateOperations.LATEST:
      return t`Latest date`;
    case AggregateOperations.COUNT_TRUE:
      return t`Count true`;
    case AggregateOperations.COUNT_FALSE:
      return t`Count false`;
    default:
      throw new CustomError(
        `Unknown aggregate operation: ${operation}`,
        'UNKNOWN_AGGREGATE_OPERATION',
      );
  }
};
