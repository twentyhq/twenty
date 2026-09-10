import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldReadRestrictable } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/isFieldReadRestrictable';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const labelIdentifierFieldMetadataId =
  personObjectMetadataItem.labelIdentifierFieldMetadataId;

const getFieldOrThrow = (fieldName: string): FieldMetadataItem => {
  const fieldMetadataItem = personObjectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (fieldMetadataItem === undefined) {
    throw new Error(`Field ${fieldName} not found on person`);
  }

  return fieldMetadataItem;
};

describe('isFieldReadRestrictable', () => {
  it('should return true for an editable field', () => {
    expect(
      isFieldReadRestrictable({
        fieldMetadataItem: getFieldOrThrow('emails'),
        labelIdentifierFieldMetadataId,
      }),
    ).toBe(true);
  });

  it.each(['createdAt', 'updatedAt', 'createdBy', 'updatedBy'])(
    'should return true for the non editable %s field',
    (fieldName) => {
      expect(
        isFieldReadRestrictable({
          fieldMetadataItem: getFieldOrThrow(fieldName),
          labelIdentifierFieldMetadataId,
        }),
      ).toBe(true);
    },
  );

  it('should return false for the label identifier field', () => {
    expect(
      isFieldReadRestrictable({
        fieldMetadataItem: getFieldOrThrow('name'),
        labelIdentifierFieldMetadataId,
      }),
    ).toBe(false);
  });

  it('should return false for deletedAt, which every read selects', () => {
    expect(
      isFieldReadRestrictable({
        fieldMetadataItem: getFieldOrThrow('deletedAt'),
        labelIdentifierFieldMetadataId,
      }),
    ).toBe(false);
  });

  it.each(['id', 'position', 'searchVector'])(
    'should return false for the hidden %s system field',
    (fieldName) => {
      expect(
        isFieldReadRestrictable({
          fieldMetadataItem: getFieldOrThrow(fieldName),
          labelIdentifierFieldMetadataId,
        }),
      ).toBe(false);
    },
  );
});
