import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldUpdateRestrictable } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/isFieldUpdateRestrictable';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');

const getFieldOrThrow = (fieldName: string): FieldMetadataItem => {
  const fieldMetadataItem = personObjectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (fieldMetadataItem === undefined) {
    throw new Error(`Field ${fieldName} not found on person`);
  }

  return fieldMetadataItem;
};

describe('isFieldUpdateRestrictable', () => {
  it('should return true for an editable field', () => {
    expect(isFieldUpdateRestrictable(getFieldOrThrow('emails'))).toBe(true);
  });

  it('should return true for the label identifier field', () => {
    expect(isFieldUpdateRestrictable(getFieldOrThrow('name'))).toBe(true);
  });

  it.each(['createdAt', 'updatedAt', 'deletedAt', 'createdBy'])(
    'should return false for the %s system field',
    (fieldName) => {
      expect(isFieldUpdateRestrictable(getFieldOrThrow(fieldName))).toBe(false);
    },
  );

  it.each(['id', 'position', 'searchVector'])(
    'should return false for the hidden %s system field',
    (fieldName) => {
      expect(isFieldUpdateRestrictable(getFieldOrThrow(fieldName))).toBe(false);
    },
  );
});
