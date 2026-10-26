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
    const addressField = getCompanyFieldOrThrow('address');

    expect(
      getPermittedFields({
        fields: [nameField, employeesField, domainNameField, addressField],
        objectPermissions: {
          restrictedFields: {
            [employeesField.id]: { canRead: false, canUpdate: false },
            [domainNameField.id]: { canRead: true, canUpdate: false },
            [addressField.id]: { canRead: false, canUpdate: true },
          },
        },
      }),
    ).toEqual({
      readableFields: [nameField, domainNameField],
      updatableFields: [nameField, addressField],
    });
  });

  it('should drop morph relation targets the role cannot read', () => {
    const targetField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('timelineActivity'),
      fieldName: 'target',
    });
    const targetNames = (targetField.morphRelations ?? []).map(
      (morphRelation) => morphRelation.targetObjectMetadata.nameSingular,
    );
    const companySourceFieldMetadataId = targetField.morphRelations?.find(
      (morphRelation) =>
        morphRelation.targetObjectMetadata.nameSingular === 'company',
    )?.sourceFieldMetadata.id;

    expect(targetNames).toContain('company');

    const { readableFields } = getPermittedFields({
      fields: [targetField],
      objectPermissions: {
        restrictedFields: {
          [companySourceFieldMetadataId as string]: {
            canRead: false,
            canUpdate: false,
          },
        },
      },
    });

    expect(
      readableFields[0].morphRelations?.map(
        (morphRelation) => morphRelation.targetObjectMetadata.nameSingular,
      ),
    ).toEqual(targetNames.filter((targetName) => targetName !== 'company'));
  });
});
