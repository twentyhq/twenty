import { getRecordFieldColumnHeader } from '@/object-record/record-column-lookup/utils/getRecordFieldColumnHeader';
import { getRecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
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
        lookupTarget: undefined,
      }),
    ).toMatchObject({
      label: companyField.label,
      icon: companyField.icon,
      description: companyField.description,
    });
  });

  it('names a lookup column after its relation and looked-up field', () => {
    expect(
      getRecordFieldColumnHeader({
        fieldMetadataItem: companyField,
        lookupTarget: getRecordFieldLookupTarget({
          recordField: { relationTargetFieldMetadataId: employeesField.id },
          fieldMetadataItem: companyField,
          objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
          isLookupColumnsEnabled: true,
        }),
      }),
    ).toEqual({
      label: `${companyField.label} › ${employeesField.label}`,
      icon: employeesField.icon,
      description: employeesField.description,
    });
  });
});
