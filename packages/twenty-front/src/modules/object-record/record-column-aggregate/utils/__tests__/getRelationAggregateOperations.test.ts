import { getRelationAggregateOperations } from '@/object-record/record-column-aggregate/utils/getRelationAggregateOperations';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { FieldMetadataType } from 'twenty-shared/types';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const opportunity = getMockObjectMetadataItemOrThrow('opportunity');
const getOpportunityField = (fieldName: string) =>
  getMockFieldMetadataItemOrThrow({
    objectMetadataItem: opportunity,
    fieldName,
  });

describe('getRelationAggregateOperations', () => {
  it('offers min, max, average and sum on a currency field', () => {
    expect(
      getRelationAggregateOperations(getOpportunityField('amount')),
    ).toEqual([
      AggregateOperations.MIN,
      AggregateOperations.MAX,
      AggregateOperations.AVG,
      AggregateOperations.SUM,
    ]);
  });

  it('offers min and max on a date field', () => {
    expect(
      getRelationAggregateOperations(getOpportunityField('closeDate')),
    ).toEqual([AggregateOperations.MIN, AggregateOperations.MAX]);
  });

  it('offers min, max and average on a rating field', () => {
    expect(
      getRelationAggregateOperations({
        ...getOpportunityField('amount'),
        name: 'score',
        type: FieldMetadataType.RATING,
      }),
    ).toEqual([
      AggregateOperations.MIN,
      AggregateOperations.MAX,
      AggregateOperations.AVG,
    ]);
  });

  it('offers nothing on a text field', () => {
    expect(getRelationAggregateOperations(getOpportunityField('name'))).toEqual(
      [],
    );
  });
});
