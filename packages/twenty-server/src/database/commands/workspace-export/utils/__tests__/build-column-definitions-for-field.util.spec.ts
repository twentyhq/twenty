import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { buildColumnDefinitionsForField } from 'src/database/commands/workspace-export/utils/build-column-definitions-for-field.util';

const makeField = (
  overrides: Partial<FieldMetadataEntity>,
): FieldMetadataEntity =>
  ({
    name: 'testField',
    type: FieldMetadataType.TEXT,
    isNullable: true,
    isUnique: false,
    settings: null,
    options: null,
    ...overrides,
  }) as FieldMetadataEntity;

describe('buildColumnDefinitionsForField', () => {
  it('should return a single text column for a TEXT field', () => {
    const result = buildColumnDefinitionsForField(
      makeField({ name: 'description', type: FieldMetadataType.TEXT }),
      'workspace_abc',
      'company',
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: 'description',
      type: 'text',
      isNullable: true,
      isPrimary: false,
      isArray: false,
    });
  });

  it('should mark the id field as primary', () => {
    const result = buildColumnDefinitionsForField(
      makeField({
        name: 'id',
        type: FieldMetadataType.UUID,
        isNullable: false,
      }),
      'workspace_abc',
      'company',
    );

    expect(result[0].isPrimary).toBe(true);
    expect(result[0].isNullable).toBe(false);
  });

  it('should serialize function default values', () => {
    const result = buildColumnDefinitionsForField(
      makeField({
        name: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
        isNullable: false,
        defaultValue: 'now' as never,
      }),
      'workspace_abc',
      'company',
    );

    expect(result[0].default).toBe('now()');
  });

  it('should return a uuid join column for a RELATION field with joinColumnName', () => {
    const result = buildColumnDefinitionsForField(
      makeField({
        name: 'company',
        type: FieldMetadataType.RELATION,
        settings: { joinColumnName: 'companyId' } as never,
      }),
      'workspace_abc',
      'person',
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: 'companyId',
      type: 'uuid',
      isNullable: true,
      isPrimary: false,
    });
  });

  it('should return empty array for a RELATION field without joinColumnName', () => {
    const result = buildColumnDefinitionsForField(
      makeField({
        name: 'people',
        type: FieldMetadataType.RELATION,
        settings: {},
      }),
      'workspace_abc',
      'company',
    );

    expect(result).toEqual([]);
  });

  it('should return a tsvector column for a TS_VECTOR field', () => {
    const result = buildColumnDefinitionsForField(
      makeField({ name: 'searchVector', type: FieldMetadataType.TS_VECTOR }),
      'workspace_abc',
      'company',
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: 'searchVector',
      type: 'tsvector',
      isNullable: true,
      isPrimary: false,
    });
  });

  it('should expand FULL_NAME composite into multiple columns', () => {
    const result = buildColumnDefinitionsForField(
      makeField({
        name: 'name',
        type: FieldMetadataType.FULL_NAME,
        isNullable: false,
      }),
      'workspace_abc',
      'person',
    );

    const columnNames = result.map((columnDefinition) => columnDefinition.name);

    expect(columnNames).toContain('nameFirstName');
    expect(columnNames).toContain('nameLastName');
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it('should mark MULTI_SELECT fields as array type', () => {
    const result = buildColumnDefinitionsForField(
      makeField({
        name: 'categories',
        type: FieldMetadataType.MULTI_SELECT,
        options: [
          { value: 'A', label: 'A', position: 0 },
          { value: 'B', label: 'B', position: 1 },
        ],
      }),
      'workspace_abc',
      'company',
    );

    expect(result[0].isArray).toBe(true);
  });
});
