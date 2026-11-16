import { getRecordFieldAggregateTarget } from '@/object-record/record-column-aggregate/utils/getRecordFieldAggregateTarget';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { getRecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { getRecordFieldColumnDescriptor } from '@/object-record/record-field/utils/getRecordFieldColumnDescriptor';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const person = getMockObjectMetadataItemOrThrow('person');
const company = getMockObjectMetadataItemOrThrow('company');
const companyField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: person,
  fieldName: 'company',
});
const employeesField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: company,
  fieldName: 'employees',
});

const opportunity = getMockObjectMetadataItemOrThrow('opportunity');
const peopleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: company,
  fieldName: 'people',
});
const opportunitiesField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: company,
  fieldName: 'opportunities',
});
const amountField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: opportunity,
  fieldName: 'amount',
});

const lookupTarget = getRecordFieldLookupTarget({
  recordField: { relationTargetFieldMetadataId: employeesField.id },
  fieldMetadataItem: companyField,
  objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
});

describe('getRecordFieldColumnDescriptor', () => {
  it('describes a plain column with its own field', () => {
    expect(
      getRecordFieldColumnDescriptor({
        fieldMetadataItem: companyField,
        lookupTarget: undefined,
        aggregateTarget: undefined,
        isFilterable: true,
        isSortable: true,
      }),
    ).toEqual({
      lookupTarget: undefined,
      aggregateTarget: undefined,
      isRelationTargetColumn: false,
      label: companyField.label,
      icon: companyField.icon,
      description: companyField.description,
      isFilterable: true,
      isSortable: true,
    });
  });

  it('describes a lookup column with the looked-up field, without filter or sort', () => {
    expect(
      getRecordFieldColumnDescriptor({
        fieldMetadataItem: companyField,
        lookupTarget,
        aggregateTarget: undefined,
        isFilterable: true,
        isSortable: true,
      }),
    ).toMatchObject({
      isRelationTargetColumn: true,
      label: `${companyField.label} › ${employeesField.label}`,
      icon: employeesField.icon,
      description: employeesField.description,
      isFilterable: false,
      isSortable: false,
    });
  });

  it('describes a count column with the relation icon, without filter or sort', () => {
    expect(
      getRecordFieldColumnDescriptor({
        fieldMetadataItem: peopleField,
        lookupTarget: undefined,
        aggregateTarget: getRecordFieldAggregateTarget({
          recordField: {
            relationAggregateOperation: AggregateOperations.COUNT,
          },
          fieldMetadataItem: peopleField,
          objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
        }),
        isFilterable: true,
        isSortable: true,
      }),
    ).toMatchObject({
      isRelationTargetColumn: true,
      label: `${peopleField.label} › Count`,
      icon: peopleField.icon,
      isFilterable: false,
      isSortable: false,
    });
  });

  it('describes a sum column with the aggregated field', () => {
    expect(
      getRecordFieldColumnDescriptor({
        fieldMetadataItem: opportunitiesField,
        lookupTarget: undefined,
        aggregateTarget: getRecordFieldAggregateTarget({
          recordField: {
            relationAggregateOperation: AggregateOperations.SUM,
            relationTargetFieldMetadataId: amountField.id,
          },
          fieldMetadataItem: opportunitiesField,
          objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
        }),
        isFilterable: false,
        isSortable: false,
      }),
    ).toMatchObject({
      label: `${opportunitiesField.label} › Sum of ${amountField.label}`,
      icon: amountField.icon,
    });
  });
});
