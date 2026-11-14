import { type GetRecordFieldLookupTarget } from '@/object-record/record-column-lookup/types/GetRecordFieldLookupTarget';
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

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const getLookupTarget: GetRecordFieldLookupTarget = (params) =>
  getRecordFieldLookupTarget({ ...params, objectMetadataItems });

describe('getLookupColumns', () => {
  it('should list the relation and target of each lookup column only', () => {
    expect(
      getLookupColumns({
        recordFields: [
          { fieldMetadataItemId: companyField.id },
          {
            fieldMetadataItemId: companyField.id,
            relationTargetFieldMetadataId: employeesField.id,
          },
          {
            fieldMetadataItemId: companyField.id,
            relationTargetFieldMetadataId: 'deleted-field-id',
          },
        ],
        fieldMetadataItemByFieldMetadataItemId: {
          [companyField.id]: companyField,
        },
        getLookupTarget,
      }),
    ).toEqual([
      {
        relationFieldName: 'company',
        lookupTargetFieldMetadataId: employeesField.id,
      },
    ]);
  });
});
