import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { getRecordFieldColumnHeader } from '@/object-record/record-column-lookup/utils/getRecordFieldColumnHeader';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('person'),
  fieldName: 'company',
});
const employeesField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
  fieldName: 'employees',
});

describe('getRecordFieldColumnHeader', () => {
  it('uses the field of a plain column', () => {
    expect(
      getRecordFieldColumnHeader({
        fieldMetadataItem: companyField,
        columnKind: { kind: 'field' },
        customLabel: undefined,
      }),
    ).toMatchObject({
      label: companyField.label,
      icon: companyField.icon,
      description: companyField.description,
    });
  });

  it('qualifies a scoped relation column so it differs from the plain one', () => {
    expect(
      getRecordFieldColumnHeader({
        fieldMetadataItem: employeesField,
        columnKind: { kind: 'scopedRecords' },
        customLabel: undefined,
      }),
    ).toMatchObject({
      label: `${employeesField.label} · Summary`,
      icon: employeesField.icon,
    });
  });

  it('names a lookup column after its relation and looked-up field', () => {
    expect(
      getRecordFieldColumnHeader({
        fieldMetadataItem: companyField,
        columnKind: {
          kind: 'lookup',
          lookupTarget: { lookupTargetFieldMetadataItem: employeesField },
        },
        customLabel: undefined,
      }),
    ).toEqual({
      label: `${companyField.label} › ${employeesField.label}`,
      icon: employeesField.icon,
      description: employeesField.description,
    });
  });

  it('names a scoped lookup column after its relation, its scope and its looked-up field', () => {
    expect(
      getRecordFieldColumnHeader({
        fieldMetadataItem: employeesField,
        columnKind: {
          kind: 'scopedLookup',
          lookupTarget: { lookupTargetFieldMetadataItem: companyField },
        },
        customLabel: undefined,
      }),
    ).toEqual({
      label: `${employeesField.label} · Summary › ${companyField.label}`,
      icon: companyField.icon,
      description: companyField.description,
    });
  });

  it('replaces the label of a renamed column and keeps its icon', () => {
    expect(
      getRecordFieldColumnHeader({
        fieldMetadataItem: employeesField,
        columnKind: {
          kind: 'scopedLookup',
          lookupTarget: { lookupTargetFieldMetadataItem: companyField },
        },
        customLabel: 'Main contacts',
      }),
    ).toEqual({
      label: 'Main contacts',
      icon: companyField.icon,
      description: companyField.description,
    });
  });

  it('keeps the default label of a column without a custom label', () => {
    expect(
      getRecordFieldColumnHeader({
        fieldMetadataItem: employeesField,
        columnKind: { kind: 'scopedRecords' },
        customLabel: null,
      }).label,
    ).toBe(`${employeesField.label} · Summary`);
  });

  it('names a summary column after its relation and its operation', () => {
    expect(
      getRecordFieldColumnHeader({
        fieldMetadataItem: employeesField,
        columnKind: {
          kind: 'summary',
          summary: { aggregateOperation: AggregateOperations.COUNT },
        },
        customLabel: undefined,
      }).label,
    ).toBe(`${employeesField.label} · Count all`);
  });

  it('names a summary column after the field it summarizes', () => {
    const amountField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('opportunity'),
      fieldName: 'amount',
    });

    expect(
      getRecordFieldColumnHeader({
        fieldMetadataItem: employeesField,
        columnKind: {
          kind: 'summary',
          summary: {
            aggregateOperation: AggregateOperations.SUM,
            aggregatedFieldMetadataItem: amountField,
          },
        },
        customLabel: undefined,
      }).label,
    ).toBe(`${employeesField.label} · Sum of ${amountField.label}`);
  });

  it('shows the custom label of a summary column instead', () => {
    expect(
      getRecordFieldColumnHeader({
        fieldMetadataItem: employeesField,
        columnKind: {
          kind: 'summary',
          summary: { aggregateOperation: AggregateOperations.COUNT },
        },
        customLabel: 'Team size',
      }).label,
    ).toBe('Team size');
  });

  it('names a summary of an unreadable field like a filtered column', () => {
    expect(
      getRecordFieldColumnHeader({
        fieldMetadataItem: employeesField,
        columnKind: { kind: 'summary' },
        customLabel: undefined,
      }).label,
    ).toBe(`${employeesField.label} · Summary`);
  });
});
