import { getSummaryFieldMetadataItemIdForOperation } from '@/object-record/record-column-summary/utils/getSummaryFieldMetadataItemIdForOperation';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';

describe('getSummaryFieldMetadataItemIdForOperation', () => {
  const summaryFieldMetadataItems = [{ id: 'amount' }, { id: 'probability' }];

  it('drops the field of a count', () => {
    expect(
      getSummaryFieldMetadataItemIdForOperation({
        aggregateOperation: AggregateOperations.COUNT,
        relationTargetFieldMetadataId: 'amount',
        summaryFieldMetadataItems,
      }),
    ).toBeNull();
  });

  it('keeps a field that supports the new operation', () => {
    expect(
      getSummaryFieldMetadataItemIdForOperation({
        aggregateOperation: AggregateOperations.AVG,
        relationTargetFieldMetadataId: 'probability',
        summaryFieldMetadataItems,
      }),
    ).toBe('probability');
  });

  it('picks the first supported field otherwise', () => {
    expect(
      getSummaryFieldMetadataItemIdForOperation({
        aggregateOperation: AggregateOperations.SUM,
        relationTargetFieldMetadataId: null,
        summaryFieldMetadataItems,
      }),
    ).toBe('amount');
  });
});
