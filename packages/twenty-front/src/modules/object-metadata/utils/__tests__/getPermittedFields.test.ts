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
    const morphRelations = targetField.morphRelations ?? [];
    const [headMorphRelation, secondMorphRelation] = morphRelations;

    const getTargetNames = (field: FieldMetadataItem | undefined) =>
      field?.morphRelations?.map(
        (morphRelation) => morphRelation.targetObjectMetadata.nameSingular,
      );

    it('should drop only the targets the role cannot read or update', () => {
      const { readableFields, updatableFields } = getPermittedFields({
        fields: [targetField],
        objectPermissions: {
          restrictedFields: {
            [secondMorphRelation.sourceFieldMetadata.id]: {
              canRead: false,
              canUpdate: false,
            },
          },
        },
      });

      const expectedTargetNames = getTargetNames(targetField)?.filter(
        (targetName) =>
          targetName !== secondMorphRelation.targetObjectMetadata.nameSingular,
      );

      expect(getTargetNames(readableFields[0])).toEqual(expectedTargetNames);
      expect(getTargetNames(updatableFields[0])).toEqual(expectedTargetNames);
    });

    it('should keep the field when only the target sharing its id is restricted', () => {
      expect(headMorphRelation.sourceFieldMetadata.id).toBe(targetField.id);

      const { readableFields } = getPermittedFields({
        fields: [targetField],
        objectPermissions: {
          restrictedFields: {
            [targetField.id]: { canRead: false, canUpdate: false },
          },
        },
      });

      expect(getTargetNames(readableFields[0])).toEqual(
        getTargetNames(targetField)?.slice(1),
      );
    });

    it('should drop the field when no target is readable', () => {
      const { readableFields, updatableFields } = getPermittedFields({
        fields: [targetField],
        objectPermissions: {
          restrictedFields: Object.fromEntries(
            morphRelations.map((morphRelation) => [
              morphRelation.sourceFieldMetadata.id,
              { canRead: false, canUpdate: true },
            ]),
          ),
        },
      });

      expect(readableFields).toEqual([]);
      expect(updatableFields).toEqual([targetField]);
    });
  });
});
