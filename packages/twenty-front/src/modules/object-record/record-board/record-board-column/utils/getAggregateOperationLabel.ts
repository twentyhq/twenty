import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { t } from '@lingui/core/macro';

export const getAggregateOperationLabel = (
  operation: ExtendedAggregateOperations,
) => {
  switch (operation) {
    case AggregateOperations.min:
      return t`Min`;
    case AggregateOperations.max:
      return t`Max`;
    case AggregateOperations.avg:
      return t`Average`;
    case AggregateOperations.sum:
      return t`Sum`;
    case AggregateOperations.count:
      return t`Count all`;
    case AggregateOperations.countEmpty:
      return t`Count empty`;
    case AggregateOperations.countNotEmpty:
      return t`Count not empty`;
    case AggregateOperations.countUniqueValues:
      return t`Count unique values`;
    case AggregateOperations.percentageEmpty:
      return t`Percent empty`;
    case AggregateOperations.percentageNotEmpty:
      return t`Percent not empty`;
    case DATE_AggregateOperations.earliest:
      return t`Earliest date`;
    case DATE_AggregateOperations.latest:
      return t`Latest date`;
    case AggregateOperations.countTrue:
      return t`Count true`;
    case AggregateOperations.countFalse:
      return t`Count false`;
    default:
      throw new Error(`Unknown aggregate operation: ${operation}`);
  }
};
