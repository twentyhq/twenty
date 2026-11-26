import { getRecordFieldSummary } from '@/object-record/record-column-summary/utils/getRecordFieldSummary';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');
const amountField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'amount',
});
const closeDateField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'closeDate',
});

const getSummary = ({
  aggregateOperation,
  relationTargetFieldMetadataId,
  relationObjectMetadataItem = opportunityObjectMetadataItem,
}: {
  aggregateOperation: AggregateOperations;
  relationTargetFieldMetadataId?: string;
  relationObjectMetadataItem?: typeof opportunityObjectMetadataItem;
}) =>
  getRecordFieldSummary({
    aggregateOperation,
    relationTargetFieldMetadataId,
    relationObjectMetadataItem,
  });

describe('getRecordFieldSummary', () => {
  it('counts the related records with their total count', () => {
    expect(
      getSummary({ aggregateOperation: AggregateOperations.COUNT }),
    ).toEqual({
      aggregateOperation: AggregateOperations.COUNT,
      aggregateGqlFieldName: 'totalCount',
    });
  });

  it('sums the amount of the related records', () => {
    expect(
      getSummary({
        aggregateOperation: AggregateOperations.SUM,
        relationTargetFieldMetadataId: amountField.id,
      }),
    ).toEqual({
      aggregateOperation: AggregateOperations.SUM,
      aggregatedFieldMetadataItem: amountField,
      aggregateGqlFieldName: 'sumAmountAmountMicros',
    });
  });

  it('reads the minimum of a date as its earliest value', () => {
    expect(
      getSummary({
        aggregateOperation: AggregateOperations.MIN,
        relationTargetFieldMetadataId: closeDateField.id,
      }),
    ).toMatchObject({
      aggregateOperation: DateAggregateOperations.EARLIEST,
      aggregateGqlFieldName: 'minCloseDate',
    });
  });

  it('leaves no summary of a field the user cannot read', () => {
    expect(
      getSummary({
        aggregateOperation: AggregateOperations.SUM,
        relationTargetFieldMetadataId: amountField.id,
        relationObjectMetadataItem: {
          ...opportunityObjectMetadataItem,
          readableFields: opportunityObjectMetadataItem.readableFields.filter(
            ({ id }) => id !== amountField.id,
          ),
        },
      }),
    ).toBeUndefined();
  });
});
