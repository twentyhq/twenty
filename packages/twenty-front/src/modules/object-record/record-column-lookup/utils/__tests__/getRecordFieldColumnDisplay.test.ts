import { getRecordFieldColumnDisplay } from '@/object-record/record-column-lookup/utils/getRecordFieldColumnDisplay';
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

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

describe('getRecordFieldColumnDisplay', () => {
  it('shows the relation field for a plain column', () => {
    expect(
      getRecordFieldColumnDisplay({
        recordField: {},
        fieldMetadataItem: companyField,
        objectMetadataItems,
      }),
    ).toEqual({
      label: companyField.label,
      icon: companyField.icon,
      description: companyField.description,
    });
  });

  it('shows the relation and the looked-up field for a lookup column', () => {
    expect(
      getRecordFieldColumnDisplay({
        recordField: { relationTargetFieldMetadataId: employeesField.id },
        fieldMetadataItem: companyField,
        objectMetadataItems,
      }),
    ).toEqual({
      label: `${companyField.label} › ${employeesField.label}`,
      icon: employeesField.icon,
      description: employeesField.description,
    });
  });

  it('prefers the custom column name', () => {
    expect(
      getRecordFieldColumnDisplay({
        recordField: {
          settings: { label: 'Team size' },
          relationTargetFieldMetadataId: employeesField.id,
        },
        fieldMetadataItem: companyField,
        objectMetadataItems,
      }).label,
    ).toBe('Team size');
  });
});
