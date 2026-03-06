import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';

export const mapRecordFilterGroupLogicalOperatorToViewFilterGroupLogicalOperator =
  ({
    recordFilterGroupLogicalOperator,
  }: {
    recordFilterGroupLogicalOperator: RecordFilterGroupLogicalOperator;
  }) => {
    return (
      {
        [RecordFilterGroupLogicalOperator.AND]:
          ViewFilterGroupLogicalOperator.AND,
        [RecordFilterGroupLogicalOperator.OR]:
          ViewFilterGroupLogicalOperator.OR,
        [RecordFilterGroupLogicalOperator.NOT]:
          ViewFilterGroupLogicalOperator.NOT,
      }[recordFilterGroupLogicalOperator] ?? ViewFilterGroupLogicalOperator.AND
    );
  };
