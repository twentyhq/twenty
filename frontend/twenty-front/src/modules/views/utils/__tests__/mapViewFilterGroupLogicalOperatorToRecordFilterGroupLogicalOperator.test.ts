import { ViewFilterGroupLogicalOperator } from '@/views/types/ViewFilterGroupLogicalOperator';
import { mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator } from '@/views/utils/mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator';
import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';

describe('mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator', () => {
  it('should map correctly for AND', () => {
    expect(
      mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator({
        viewFilterGroupLogicalOperator: ViewFilterGroupLogicalOperator.AND,
      }),
    ).toEqual(RecordFilterGroupLogicalOperator.AND);
  });

  it('should map correctly for OR', () => {
    expect(
      mapViewFilterGroupLogicalOperatorToRecordFilterGroupLogicalOperator({
        viewFilterGroupLogicalOperator: ViewFilterGroupLogicalOperator.OR,
      }),
    ).toEqual(RecordFilterGroupLogicalOperator.OR);
  });
});
