import { getRecordFieldAggregateTarget } from '@/object-record/record-column-aggregate/utils/getRecordFieldAggregateTarget';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const company = getMockObjectMetadataItemOrThrow('company');
const person = getMockObjectMetadataItemOrThrow('person');
const opportunity = getMockObjectMetadataItemOrThrow('opportunity');

const peopleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: company,
  fieldName: 'people',
});
const opportunitiesField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: company,
  fieldName: 'opportunities',
});
const personCompanyField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: person,
  fieldName: 'company',
});
const amountField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunity,
  fieldName: 'amount',
});
const closeDateField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunity,
  fieldName: 'closeDate',
});
const opportunityNameField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunity,
  fieldName: 'name',
});

describe('getRecordFieldAggregateTarget', () => {
  it('counts the related records of a one-to-many relation', () => {
    expect(
      getRecordFieldAggregateTarget({
        recordField: { relationAggregateOperation: AggregateOperations.COUNT },
        fieldMetadataItem: peopleField,
        objectMetadataItems,
      }),
    ).toMatchObject({
      relationFieldName: 'people',
      aggregateOperation: AggregateOperations.COUNT,
      aggregatedFieldMetadataItem: undefined,
      aggregateGqlFieldName: 'totalCount',
    });
  });

  it('sums a currency field of the related records in micros', () => {
    expect(
      getRecordFieldAggregateTarget({
        recordField: {
          relationAggregateOperation: AggregateOperations.SUM,
          relationTargetFieldMetadataId: amountField.id,
        },
        fieldMetadataItem: opportunitiesField,
        objectMetadataItems,
      }),
    ).toMatchObject({
      relationFieldName: 'opportunities',
      aggregatedFieldMetadataItem: { id: amountField.id },
      aggregateGqlFieldName: 'sumAmountAmountMicros',
    });
  });

  it('reads the maximum of a date as its latest value', () => {
    expect(
      getRecordFieldAggregateTarget({
        recordField: {
          relationAggregateOperation: AggregateOperations.MAX,
          relationTargetFieldMetadataId: closeDateField.id,
        },
        fieldMetadataItem: opportunitiesField,
        objectMetadataItems,
      }),
    ).toMatchObject({
      aggregateOperation: DateAggregateOperations.LATEST,
      aggregateGqlFieldName: 'maxCloseDate',
    });
  });

  it.each([
    {
      title: 'a sum of dates',
      fieldMetadataItem: opportunitiesField,
      relationAggregateOperation: AggregateOperations.SUM,
      relationTargetFieldMetadataId: closeDateField.id,
    },
    {
      title: 'a sum of a text field',
      fieldMetadataItem: opportunitiesField,
      relationAggregateOperation: AggregateOperations.SUM,
      relationTargetFieldMetadataId: opportunityNameField.id,
    },
    {
      title: 'a count with a target field',
      fieldMetadataItem: opportunitiesField,
      relationAggregateOperation: AggregateOperations.COUNT,
      relationTargetFieldMetadataId: amountField.id,
    },
    {
      title: 'a sum without a target field',
      fieldMetadataItem: opportunitiesField,
      relationAggregateOperation: AggregateOperations.SUM,
      relationTargetFieldMetadataId: null,
    },
    {
      title: 'an aggregate on a many-to-one relation',
      fieldMetadataItem: personCompanyField,
      relationAggregateOperation: AggregateOperations.COUNT,
      relationTargetFieldMetadataId: null,
    },
  ])(
    'rejects $title',
    ({
      fieldMetadataItem,
      relationAggregateOperation,
      relationTargetFieldMetadataId,
    }) => {
      expect(
        getRecordFieldAggregateTarget({
          recordField: {
            relationAggregateOperation,
            relationTargetFieldMetadataId,
          },
          fieldMetadataItem,
          objectMetadataItems,
        }),
      ).toBeUndefined();
    },
  );

  it('keeps an aggregate of a field the user cannot read, marked unreadable', () => {
    const objectMetadataItemsWithoutReadableAmount = objectMetadataItems.map(
      (objectMetadataItem) =>
        objectMetadataItem.id === opportunity.id
          ? {
              ...objectMetadataItem,
              readableFields: objectMetadataItem.readableFields.filter(
                ({ id }) => id !== amountField.id,
              ),
            }
          : objectMetadataItem,
    );

    expect(
      getRecordFieldAggregateTarget({
        recordField: {
          relationAggregateOperation: AggregateOperations.SUM,
          relationTargetFieldMetadataId: amountField.id,
        },
        fieldMetadataItem: opportunitiesField,
        objectMetadataItems: objectMetadataItemsWithoutReadableAmount,
      }),
    ).toMatchObject({
      aggregatedFieldMetadataItem: { id: amountField.id },
      isAggregatedFieldReadable: false,
    });
  });

  it('ignores a view field without aggregate operation', () => {
    expect(
      getRecordFieldAggregateTarget({
        recordField: { relationAggregateOperation: null },
        fieldMetadataItem: peopleField,
        objectMetadataItems,
      }),
    ).toBeUndefined();
  });
});
