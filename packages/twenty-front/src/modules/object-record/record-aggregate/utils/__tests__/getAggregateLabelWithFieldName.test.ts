import { getAggregateLabelWithFieldName } from '@/object-record/record-aggregate/utils/getAggregateLabelWithFieldName';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { findByProperty } from 'twenty-shared/utils';
import { getMockCompanyObjectMetadataItem } from '~/testing/mock-data/companies';

describe('getAggregateLabelWithFieldName', () => {
  const mockFieldMetadataItem = getMockCompanyObjectMetadataItem().fields.find(
    findByProperty('name', 'name'),
  )!;

  it('should return correct label for provided field metadata item and operation', () => {
    expect(
      getAggregateLabelWithFieldName({
        aggregateFieldMetadataItem: mockFieldMetadataItem,
        aggregateOperation: AggregateOperations.COUNT,
      }),
    ).toBe('All of Name');
  });
});
