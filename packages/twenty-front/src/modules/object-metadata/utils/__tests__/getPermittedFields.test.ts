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

  describe('morph relation fields', () => {
    const targetField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: getMockObjectMetadataItemOrThrow('taskTarget'),
      fieldName: 'target',
    });
    const headField: FieldMetadataItem = {
      ...targetField,
      id: '6f1c0e0a-5d3b-4c6e-9a51-3b8f6e2d7c40',
    };
    const morphRelations = headField.morphRelations ?? [];
    const [firstMorphRelation] = morphRelations;

    const getTargetNames = (field: FieldMetadataItem | undefined) =>
      field?.morphRelations?.map(
        (morphRelation) => morphRelation.targetObjectMetadata.nameSingular,
      );

    it('should drop only the targets the role cannot read or update', () => {
      const { readableFields, updatableFields } = getPermittedFields({
        fields: [headField],
        objectPermissions: {
          restrictedFields: {
            [firstMorphRelation.sourceFieldMetadata.id]: {
              canRead: false,
              canUpdate: false,
            },
          },
        },
      });

      const expectedTargetNames = getTargetNames(headField)?.slice(1);

      expect(getTargetNames(readableFields[0])).toEqual(expectedTargetNames);
      expect(getTargetNames(updatableFields[0])).toEqual(expectedTargetNames);
    });

    it('should drop the field when its head is restricted', () => {
      expect(
        getPermittedFields({
          fields: [headField],
          objectPermissions: {
            restrictedFields: {
              [headField.id]: { canRead: false, canUpdate: true },
            },
          },
        }),
      ).toEqual({ readableFields: [], updatableFields: [headField] });
    });

    it('should keep the field without targets when no target is readable', () => {
      const { readableFields, updatableFields } = getPermittedFields({
        fields: [headField],
        objectPermissions: {
          restrictedFields: Object.fromEntries(
            morphRelations.map((morphRelation) => [
              morphRelation.sourceFieldMetadata.id,
              { canRead: false, canUpdate: true },
            ]),
          ),
        },
      });

      expect(getTargetNames(readableFields[0])).toEqual([]);
      expect(updatableFields).toEqual([headField]);
    });
  });
});
