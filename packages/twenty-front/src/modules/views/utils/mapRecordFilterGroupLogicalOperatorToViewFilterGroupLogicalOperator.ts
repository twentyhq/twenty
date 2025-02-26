import { RecordFilterGroupLogicalOperator } from '@/object-record/record-filter-group/types/RecordFilterGroupLogicalOperator';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';

export const mapRecordFilterGroupLogicalOperatorToViewFilterGroupLogicalOperator =
  ({
    recordFilterGroupLogicalOperator,
  }: {
    recordFilterGroupLogicalOperator: RecordFilterGroupLogicalOperator;
  }) => {
    return recordFilterGroupLogicalOperator ===
      RecordFilterGroupLogicalOperator.AND
      ? ViewFilterGroupLogicalOperator.AND
      : ViewFilterGroupLogicalOperator.OR;
  };
