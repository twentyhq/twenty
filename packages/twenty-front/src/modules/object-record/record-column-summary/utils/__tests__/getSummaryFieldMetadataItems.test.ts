import { getSummaryFieldMetadataItems } from '@/object-record/record-column-summary/utils/getSummaryFieldMetadataItems';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

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
