import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

export const mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator =
  ({
    viewFilterGroupLogicalOperator,
  }: {
    viewFilterGroupLogicalOperator: ViewFilterGroupLogicalOperator;
  }) => {
    switch (viewFilterGroupLogicalOperator) {
      case ViewFilterGroupLogicalOperator.AND:
        return RecordFilterGroupLogicalOperator.AND;
      case ViewFilterGroupLogicalOperator.OR:
        return RecordFilterGroupLogicalOperator.OR;
      case ViewFilterGroupLogicalOperator.NOT:
        return RecordFilterGroupLogicalOperator.NOT;
      default:
        throw assertUnreachable(viewFilterGroupLogicalOperator);
    }
  };
