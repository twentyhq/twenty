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
const nameField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunityObjectMetadataItem,
  fieldName: 'name',
});

describe('getRecordFieldSummary', () => {
  it('reads nothing from a column without an aggregate operation', () => {
    expect(
      getRecordFieldSummary({
        recordField: {
          relationAggregateOperation: null,
          relationTargetFieldMetadataId: amountField.id,
        },
        relationObjectMetadataItem: opportunityObjectMetadataItem,
      }),
    ).toBeUndefined();
  });

  it('counts the related records with their total count', () => {
    expect(
      getRecordFieldSummary({
        recordField: { relationAggregateOperation: AggregateOperations.COUNT },
        relationObjectMetadataItem: opportunityObjectMetadataItem,
      }),
    ).toEqual({
      aggregateOperation: AggregateOperations.COUNT,
      aggregateGqlFieldName: 'totalCount',
      isAggregatedFieldReadable: true,
    });
  });

  it('sums the amount of the related records', () => {
    expect(
      getRecordFieldSummary({
        recordField: {
          relationAggregateOperation: AggregateOperations.SUM,
          relationTargetFieldMetadataId: amountField.id,
        },
        relationObjectMetadataItem: opportunityObjectMetadataItem,
      }),
    ).toEqual({
      aggregateOperation: AggregateOperations.SUM,
      aggregatedFieldMetadataItem: amountField,
      aggregateGqlFieldName: 'sumAmountAmountMicros',
      isAggregatedFieldReadable: true,
    });
  });

  it('reads the minimum of a date as its earliest value', () => {
    expect(
      getRecordFieldSummary({
        recordField: {
          relationAggregateOperation: AggregateOperations.MIN,
          relationTargetFieldMetadataId: closeDateField.id,
        },
        relationObjectMetadataItem: opportunityObjectMetadataItem,
      }),
    ).toMatchObject({
      aggregateOperation: DateAggregateOperations.EARLIEST,
      aggregateGqlFieldName: 'minCloseDate',
    });
  });

  it('reads nothing from an operation the field does not support', () => {
    expect(
      getRecordFieldSummary({
        recordField: {
          relationAggregateOperation: AggregateOperations.SUM,
          relationTargetFieldMetadataId: nameField.id,
        },
        relationObjectMetadataItem: opportunityObjectMetadataItem,
      }),
    ).toBeUndefined();
  });

  it('keeps a summary of a field the user cannot read, marked unreadable', () => {
    expect(
      getRecordFieldSummary({
        recordField: {
          relationAggregateOperation: AggregateOperations.SUM,
          relationTargetFieldMetadataId: amountField.id,
        },
        relationObjectMetadataItem: {
          ...opportunityObjectMetadataItem,
          readableFields: opportunityObjectMetadataItem.readableFields.filter(
            ({ id }) => id !== amountField.id,
          ),
        },
      }),
    ).toMatchObject({ isAggregatedFieldReadable: false });
  });
});
