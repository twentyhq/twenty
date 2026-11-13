import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { shouldDisplayFormMultiEditField } from '@/object-record/record-update-multiple/utils/shouldDisplayFormMultiEditField';
import { FieldMetadataType } from 'twenty-shared/types';

const createMockFieldMetadataItem = (
  overrides: Partial<FieldMetadataItem> = {},
): FieldMetadataItem =>
  ({
    id: 'test-field-id',
    name: 'testField',
    label: 'Test Field',
    type: FieldMetadataType.TEXT,
    isActive: true,
    isSystem: false,
    isUIEditable: true,
    isUnique: false,
    isNullable: true,
    ...overrides,
  }) as FieldMetadataItem;

describe('shouldDisplayFormMultiEditField', () => {
  it('should return true for a regular text field', () => {
    const field = createMockFieldMetadataItem({
      type: FieldMetadataType.TEXT,
    });

    expect(shouldDisplayFormMultiEditField(field)).toBe(true);
  });

  it('should return false for unique fields', () => {
    const field = createMockFieldMetadataItem({
      type: FieldMetadataType.TEXT,
      isUnique: true,
    });

    expect(shouldDisplayFormMultiEditField(field)).toBe(false);
  });

  it('should return false for inactive fields', () => {
    const field = createMockFieldMetadataItem({
      isActive: false,
    });

    expect(shouldDisplayFormMultiEditField(field)).toBe(false);
  });

  describe('field permissions', () => {
    it('should return false when the user cannot update the field', () => {
      const field = createMockFieldMetadataItem({
        id: 'restricted-field-id',
      });

      const objectPermissions = {
        unreadableFields: [],
        uneditableFields: ['restricted-field-id'],
      };

      expect(shouldDisplayFormMultiEditField(field, objectPermissions)).toBe(
        false,
      );
    });

    it('should return false when the user cannot read the field', () => {
      const field = createMockFieldMetadataItem({
        id: 'restricted-field-id',
      });

      const objectPermissions = {
        unreadableFields: ['restricted-field-id'],
        uneditableFields: [],
      };

      expect(shouldDisplayFormMultiEditField(field, objectPermissions)).toBe(
        false,
      );
    });

    it('should return true when the user can read and update the field', () => {
      const field = createMockFieldMetadataItem({
        id: 'allowed-field-id',
      });

      const objectPermissions = {
        unreadableFields: [],
        uneditableFields: [],
      };

      expect(shouldDisplayFormMultiEditField(field, objectPermissions)).toBe(
        true,
      );
    });

    it('should return true when the field has no restrictions in objectPermissions', () => {
      const field = createMockFieldMetadataItem({
        id: 'unrestricted-field-id',
      });

      const objectPermissions = {
        unreadableFields: ['other-field-id'],
        uneditableFields: ['other-field-id'],
      };

      expect(shouldDisplayFormMultiEditField(field, objectPermissions)).toBe(
        true,
      );
    });
  });
});
