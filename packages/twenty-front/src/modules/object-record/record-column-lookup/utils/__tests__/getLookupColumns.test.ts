import { getRecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { getLookupColumns } from '@/object-record/record-column-lookup/utils/getLookupColumns';
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

describe('getLookupColumns', () => {
  it('should list the relation and target of each lookup column only', () => {
    expect(
      getLookupColumns({
        recordFields: [{ id: 'plain' }, { id: 'lookup' }, { id: 'unknown' }],
        columnDescriptorByRecordFieldId: {
          plain: { lookupTarget: undefined },
          lookup: {
            lookupTarget: getRecordFieldLookupTarget({
              recordField: { relationTargetFieldMetadataId: employeesField.id },
              fieldMetadataItem: companyField,
              objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
            }),
          },
        },
      }),
    ).toEqual([
      {
        relationFieldName: 'company',
        lookupTargetFieldName: 'employees',
      },
    ]);
  });
});
