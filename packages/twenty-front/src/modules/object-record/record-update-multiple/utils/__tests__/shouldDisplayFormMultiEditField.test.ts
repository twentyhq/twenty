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
    isUIReadOnly: false,
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
});
