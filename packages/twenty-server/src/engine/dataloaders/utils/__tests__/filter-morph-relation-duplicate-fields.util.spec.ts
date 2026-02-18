import { FieldMetadataType } from 'twenty-shared/types';

import { filterMorphRelationDuplicateFields } from 'src/engine/dataloaders/utils/filter-morph-relation-duplicate-fields.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const makeMorphField = (
  overrides: Partial<FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>> & {
    id: string;
    morphId: string;
  },
): FlatFieldMetadata<FieldMetadataType.MORPH_RELATION> =>
  ({
    type: FieldMetadataType.MORPH_RELATION,
    isActive: true,
    isSystem: false,
    ...overrides,
  }) as FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;

const makeTextField = (id: string): FlatFieldMetadata<FieldMetadataType.TEXT> =>
  ({
    id,
    type: FieldMetadataType.TEXT,
  }) as FlatFieldMetadata<FieldMetadataType.TEXT>;

describe('filterMorphRelationDuplicateFields', () => {
  it('should return all fields when there are no morph fields', () => {
    const fields = [makeTextField('t1'), makeTextField('t2')];

    expect(filterMorphRelationDuplicateFields(fields)).toEqual(fields);
  });

  it('should return all fields when morph fields have distinct morphIds', () => {
    const morph1 = makeMorphField({ id: 'a', morphId: 'morph-1' });
    const morph2 = makeMorphField({ id: 'b', morphId: 'morph-2' });
    const text = makeTextField('t1');

    const result = filterMorphRelationDuplicateFields([morph1, text, morph2]);

    expect(result).toHaveLength(3);
    expect(result).toContain(text);
    expect(result).toContain(morph1);
    expect(result).toContain(morph2);
  });

  it('should deduplicate morph fields sharing the same morphId', () => {
    const standard = makeMorphField({
      id: 'b',
      morphId: 'morph-1',
      isSystem: false,
    });
    const system = makeMorphField({
      id: 'a',
      morphId: 'morph-1',
      isSystem: true,
    });
    const text = makeTextField('t1');

    const result = filterMorphRelationDuplicateFields([system, text, standard]);

    expect(result).toHaveLength(2);
    expect(result).toContain(text);
    expect(result).toContain(standard);
    expect(result).not.toContain(system);
  });

  it('should handle multiple morph groups independently', () => {
    const group1Best = makeMorphField({
      id: 'a',
      morphId: 'morph-1',
      isSystem: false,
    });
    const group1Dup = makeMorphField({
      id: 'b',
      morphId: 'morph-1',
      isSystem: true,
    });
    const group2Best = makeMorphField({
      id: 'c',
      morphId: 'morph-2',
      isSystem: false,
    });
    const group2Dup = makeMorphField({
      id: 'd',
      morphId: 'morph-2',
      isSystem: true,
    });

    const result = filterMorphRelationDuplicateFields([
      group1Dup,
      group2Dup,
      group1Best,
      group2Best,
    ]);

    expect(result).toHaveLength(2);
    expect(result).toContain(group1Best);
    expect(result).toContain(group2Best);
  });

  it('should return empty array for empty input', () => {
    expect(filterMorphRelationDuplicateFields([])).toEqual([]);
  });
});
