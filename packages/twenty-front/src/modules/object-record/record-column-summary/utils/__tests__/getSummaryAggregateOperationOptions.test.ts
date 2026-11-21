import { getSummaryAggregateOperationOptions } from '@/object-record/record-column-summary/utils/getSummaryAggregateOperationOptions';
import { getSummaryFieldMetadataItemIdForOperation } from '@/object-record/record-column-summary/utils/getSummaryFieldMetadataItemIdForOperation';
import { getSummaryFieldMetadataItems } from '@/object-record/record-column-summary/utils/getSummaryFieldMetadataItems';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

describe('getSummaryAggregateOperationOptions', () => {
  it('offers count, then the operations at least one related field supports', () => {
    expect(
      getSummaryAggregateOperationOptions({
        relationObjectMetadataItem: opportunityObjectMetadataItem,
        isJunctionRelation: false,
      }),
    ).toEqual([
      AggregateOperations.COUNT,
      AggregateOperations.MIN,
      AggregateOperations.MAX,
      AggregateOperations.AVG,
      AggregateOperations.SUM,
    ]);
  });

  it('offers only count on a join object relation', () => {
    expect(
      getSummaryAggregateOperationOptions({
        relationObjectMetadataItem: opportunityObjectMetadataItem,
        isJunctionRelation: true,
      }),
    ).toEqual([AggregateOperations.COUNT]);
  });
});

describe('getSummaryFieldMetadataItems', () => {
  it('lists only the related fields that support the operation', () => {
    const fieldNames = getSummaryFieldMetadataItems({
      relationObjectMetadataItem: opportunityObjectMetadataItem,
      aggregateOperation: AggregateOperations.SUM,
    }).map(({ name }) => name);

    expect(fieldNames).toContain('amount');
    expect(fieldNames).not.toContain('closeDate');
    expect(fieldNames).not.toContain('name');
  });
});

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
