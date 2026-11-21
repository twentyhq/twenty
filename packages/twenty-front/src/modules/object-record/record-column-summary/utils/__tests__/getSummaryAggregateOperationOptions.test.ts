import { getSummaryAggregateOperationOptions } from '@/object-record/record-column-summary/utils/getSummaryAggregateOperationOptions';
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
