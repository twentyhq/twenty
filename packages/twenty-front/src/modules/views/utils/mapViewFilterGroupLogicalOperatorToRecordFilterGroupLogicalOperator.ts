import { RecordFilterGroupLogicalOperator } from '@/object-record/record-filter-group/types/RecordFilterGroupLogicalOperator';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';

export const mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator =
  ({
    viewFilterGroupLogicalOperator,
  }: {
    viewFilterGroupLogicalOperator: ViewFilterGroupLogicalOperator;
  }) => {
    return viewFilterGroupLogicalOperator === ViewFilterGroupLogicalOperator.AND
      ? RecordFilterGroupLogicalOperator.AND
      : RecordFilterGroupLogicalOperator.OR;
  };
