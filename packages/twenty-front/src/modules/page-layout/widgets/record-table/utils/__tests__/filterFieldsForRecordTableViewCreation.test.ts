import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { filterFieldsForRecordTableViewCreation } from '@/page-layout/widgets/record-table/utils/filterFieldsForRecordTableViewCreation';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('filterFieldsForRecordTableViewCreation', () => {
  const baseField: Omit<FieldMetadataItem, 'id' | 'name' | 'type'> = {
    label: '',
    description: '',
    icon: 'IconCheck',
    isCustom: false,
    isActive: true,
    isSystem: false,
    isNullable: true,
    isUnique: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    universalIdentifier: 'universal-identifier',
  };

  it('should include normal active fields', () => {
    const field: FieldMetadataItem = {
      ...baseField,
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
    };
    expect(filterFieldsForRecordTableViewCreation(field)).toBe(true);
  });

  it('should exclude inactive fields', () => {
    const field: FieldMetadataItem = {
      ...baseField,
      id: 'field-1',
      name: 'name',
      type: FieldMetadataType.TEXT,
      isActive: false,
    };
    expect(filterFieldsForRecordTableViewCreation(field)).toBe(false);
  });

  it('should exclude system fields normally', () => {
    const field: FieldMetadataItem = {
      ...baseField,
      id: 'field-id',
      name: 'id',
      type: FieldMetadataType.UUID,
      isSystem: true,
    };
    expect(filterFieldsForRecordTableViewCreation(field)).toBe(false);
  });

  it('should include system fields if they are the label identifier', () => {
    const field: FieldMetadataItem = {
      ...baseField,
      id: 'field-id',
      name: 'id',
      type: FieldMetadataType.UUID,
      isSystem: true,
    };
    expect(filterFieldsForRecordTableViewCreation(field, 'field-id')).toBe(
      true,
    );
  });

  it('should include hidden system fields if they are the label identifier', () => {
    const field: FieldMetadataItem = {
      ...baseField,
      id: 'field-position',
      name: 'position',
      type: FieldMetadataType.NUMBER,
      isSystem: true,
    };
    expect(
      filterFieldsForRecordTableViewCreation(field, 'field-position'),
    ).toBe(true);
  });
});
