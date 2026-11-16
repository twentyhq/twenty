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
        isFilterable: true,
        isSortable: true,
      }),
    ).toEqual({
      lookupTarget: undefined,
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
        isFilterable: true,
        isSortable: true,
      }),
    ).toMatchObject({
      label: `${companyField.label} › ${employeesField.label}`,
      icon: employeesField.icon,
      description: employeesField.description,
      isFilterable: false,
      isSortable: false,
    });
  });
});
