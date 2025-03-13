import { RecordFilterGroupLogicalOperator } from '@/object-record/record-filter-group/types/RecordFilterGroupLogicalOperator';
import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { mapRecordFilterGroupLogicalOperatorToViewFilterGroupLogicalOperator } from '@/views/utils/mapRecordFilterGroupLogicalOperatorToViewFilterGroupLogicalOperator';

describe('mapRecordFilterGroupLogicalOperatorToViewFilterGroupLogicalOperator', () => {
  it('should map correctly for AND', () => {
    expect(
      mapRecordFilterGroupLogicalOperatorToViewFilterGroupLogicalOperator({
        recordFilterGroupLogicalOperator: RecordFilterGroupLogicalOperator.AND,
      }),
    ).toEqual(ViewFilterGroupLogicalOperator.AND);
  });

  it('should map correctly for OR', () => {
    expect(
      mapRecordFilterGroupLogicalOperatorToViewFilterGroupLogicalOperator({
        recordFilterGroupLogicalOperator: RecordFilterGroupLogicalOperator.OR,
      }),
    ).toEqual(ViewFilterGroupLogicalOperator.OR);
  });
});
