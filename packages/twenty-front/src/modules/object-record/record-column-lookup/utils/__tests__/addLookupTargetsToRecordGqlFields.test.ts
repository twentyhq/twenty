import { addLookupTargetsToRecordGqlFields } from '@/object-record/record-column-lookup/utils/addLookupTargetsToRecordGqlFields';
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

const fieldMetadataItemByFieldMetadataItemId = {
  [companyField.id]: companyField,
};

describe('addLookupTargetsToRecordGqlFields', () => {
  it('adds the looked-up field inside the relation selection', () => {
    expect(
      addLookupTargetsToRecordGqlFields({
        recordGqlFields: { company: { id: true, name: true }, companyId: true },
        recordFields: [
          {
            fieldMetadataItemId: companyField.id,
            relationTargetFieldMetadataId: employeesField.id,
          },
        ],
        fieldMetadataItemByFieldMetadataItemId,
        objectMetadataItems,
      }),
    ).toEqual({
      company: { id: true, name: true, employees: true },
      companyId: true,
    });
  });

  it('leaves the selection unchanged for a column without a lookup', () => {
    const recordGqlFields = { company: { id: true, name: true } };

    expect(
      addLookupTargetsToRecordGqlFields({
        recordGqlFields,
        recordFields: [{ fieldMetadataItemId: companyField.id }],
        fieldMetadataItemByFieldMetadataItemId,
        objectMetadataItems,
      }),
    ).toEqual(recordGqlFields);
  });
});
