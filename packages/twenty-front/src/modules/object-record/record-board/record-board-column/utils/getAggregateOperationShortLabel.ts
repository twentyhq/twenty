import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { msg } from '@lingui/core/macro';

export const getAggregateOperationShortLabel = (
  operation: ExtendedAggregateOperations,
) => {
  switch (operation) {
    case AggregateOperations.min:
      return msg`Min`;
    case AggregateOperations.max:
      return msg`Max`;
    case AggregateOperations.avg:
      return msg`Average`;
    case AggregateOperations.sum:
      return msg`Sum`;
    case AggregateOperations.count:
      return msg`All`;
    case AggregateOperations.countEmpty:
    case AggregateOperations.percentageEmpty:
      return msg`Empty`;
    case AggregateOperations.countNotEmpty:
    case AggregateOperations.percentageNotEmpty:
      return msg`Not empty`;
    case AggregateOperations.countUniqueValues:
      return msg`Unique`;
    case DATE_AggregateOperations.earliest:
      return msg`Earliest`;
    case DATE_AggregateOperations.latest:
      return msg`Latest`;
    case AggregateOperations.countTrue:
      return msg`True`;
    case AggregateOperations.countFalse:
      return msg`False`;
    default:
      throw new Error(`Unknown aggregate operation: ${operation}`);
  }
};
