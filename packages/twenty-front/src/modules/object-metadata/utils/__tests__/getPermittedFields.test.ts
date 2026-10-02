import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getPermittedFields } from '@/object-metadata/utils/getPermittedFields';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const getCompanyFieldOrThrow = (fieldName: string): FieldMetadataItem =>
  getMockFieldMetadataItemOrThrow({
    objectMetadataItem: companyObjectMetadataItem,
    fieldName,
  });

describe('getPermittedFields', () => {
  it('should split fields by their read and update restrictions', () => {
    const nameField = getCompanyFieldOrThrow('name');
    const employeesField = getCompanyFieldOrThrow('employees');
    const domainNameField = getCompanyFieldOrThrow('domainName');

    expect(
      getPermittedFields({
        fields: [nameField, employeesField, domainNameField],
        objectPermissions: {
          restrictedFields: {
            [employeesField.id]: { canRead: false, canUpdate: false },
            [domainNameField.id]: { canRead: true, canUpdate: false },
          },
        },
      }),
    ).toEqual({
      readableFields: [nameField, domainNameField],
      updatableFields: [nameField],
    });
  });
});
