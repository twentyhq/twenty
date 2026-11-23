import { getSummaryFieldMetadataItemsByOperation } from '@/object-record/record-column-summary/utils/getSummaryFieldMetadataItemsByOperation';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

describe('getSummaryFieldMetadataItemsByOperation', () => {
  it('lists, for each operation, the related fields that support it', () => {
    const fieldMetadataItemsByOperation =
      getSummaryFieldMetadataItemsByOperation(opportunityObjectMetadataItem);

    const fieldNamesByOperation = Object.fromEntries(
      Object.entries(fieldMetadataItemsByOperation).map(
        ([aggregateOperation, fieldMetadataItems]) => [
          aggregateOperation,
          fieldMetadataItems.map(({ name }) => name),
        ],
      ),
    );

    expect(fieldNamesByOperation[AggregateOperations.SUM]).toContain('amount');
    expect(fieldNamesByOperation[AggregateOperations.SUM]).not.toContain(
      'closeDate',
    );
    expect(fieldNamesByOperation[AggregateOperations.MIN]).toContain(
      'closeDate',
    );
    expect(fieldNamesByOperation).not.toHaveProperty(AggregateOperations.COUNT);
  });

  it('leaves out an operation no readable field supports', () => {
    expect(
      getSummaryFieldMetadataItemsByOperation({
        readableFields: opportunityObjectMetadataItem.readableFields.filter(
          ({ name }) => name === 'name',
        ),
      }),
    ).toEqual({});
  });
});
