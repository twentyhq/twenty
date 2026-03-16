import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { buildEnumDefinitionsForField } from 'src/database/commands/workspace-export/utils/build-enum-definitions-for-field.util';

const makeField = (
  overrides: Partial<FieldMetadataEntity>,
): FieldMetadataEntity =>
  ({
    name: 'testField',
    type: FieldMetadataType.TEXT,
    isNullable: true,
    settings: null,
    options: null,
    ...overrides,
  }) as FieldMetadataEntity;

describe('buildEnumDefinitionsForField', () => {
  it('should return empty array for non-enum fields', () => {
    const result = buildEnumDefinitionsForField(
      makeField({ name: 'description', type: FieldMetadataType.TEXT }),
      'workspace_abc',
      'company',
    );

    expect(result).toEqual([]);
  });

  it('should extract enum definition for a SELECT field', () => {
    const result = buildEnumDefinitionsForField(
      makeField({
        name: 'status',
        type: FieldMetadataType.SELECT,
        options: [
          { value: 'ACTIVE', label: 'Active', position: 0 },
          { value: 'INACTIVE', label: 'Inactive', position: 1 },
        ],
      }),
      'workspace_abc',
      'company',
    );

    expect(result).toHaveLength(1);
    expect(result[0].values).toEqual(['ACTIVE', 'INACTIVE']);
    expect(result[0].qualifiedName).toContain('workspace_abc');
    expect(result[0].qualifiedName).toContain('company_status_enum');
  });

  it('should return empty array for SELECT field with no options', () => {
    const result = buildEnumDefinitionsForField(
      makeField({
        name: 'status',
        type: FieldMetadataType.SELECT,
        options: [],
      }),
      'workspace_abc',
      'company',
    );

    expect(result).toEqual([]);
  });

  it('should extract enum definition for a RATING field', () => {
    const result = buildEnumDefinitionsForField(
      makeField({
        name: 'rating',
        type: FieldMetadataType.RATING,
        options: [
          { value: 'RATING_1', label: 'Rating 1', position: 0 },
          { value: 'RATING_2', label: 'Rating 2', position: 1 },
          { value: 'RATING_3', label: 'Rating 3', position: 2 },
        ],
      }),
      'workspace_abc',
      'opportunity',
    );

    expect(result).toHaveLength(1);
    expect(result[0].values).toEqual(['RATING_1', 'RATING_2', 'RATING_3']);
  });
});
