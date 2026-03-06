import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';

export const mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator =
  ({
    viewFilterGroupLogicalOperator,
  }: {
    viewFilterGroupLogicalOperator: ViewFilterGroupLogicalOperator;
  }) => {
    return (
      {
        [ViewFilterGroupLogicalOperator.AND]:
          RecordFilterGroupLogicalOperator.AND,
        [ViewFilterGroupLogicalOperator.OR]:
          RecordFilterGroupLogicalOperator.OR,
        [ViewFilterGroupLogicalOperator.NOT]:
          RecordFilterGroupLogicalOperator.NOT,
      }[viewFilterGroupLogicalOperator] ?? RecordFilterGroupLogicalOperator.AND
    );
  };
