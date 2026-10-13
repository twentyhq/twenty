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

    expect(
      filterMorphRelationDuplicateFields({
        flatFieldMetadatas: fields,
        isMorphRelationHeadEnabled: false,
      }),
    ).toEqual(fields);
  });

  it('should return all fields when morph fields have distinct morphIds', () => {
    const morph1 = makeMorphField({ id: 'a', morphId: 'morph-1' });
    const morph2 = makeMorphField({ id: 'b', morphId: 'morph-2' });
    const text = makeTextField('t1');

    const result = filterMorphRelationDuplicateFields({
      flatFieldMetadatas: [morph1, text, morph2],
      isMorphRelationHeadEnabled: false,
    });

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

    const result = filterMorphRelationDuplicateFields({
      flatFieldMetadatas: [system, text, standard],
      isMorphRelationHeadEnabled: false,
    });

    expect(result).toHaveLength(2);
    expect(result).toContain(text);
    expect(result).toContain(standard);
    expect(result).not.toContain(system);
  });

  it('should handle multiple morph groups independently', () => {
    const head1Best = makeMorphField({
      id: 'a',
      morphId: 'morph-1',
      isSystem: false,
    });
    const head1Dup = makeMorphField({
      id: 'b',
      morphId: 'morph-1',
      isSystem: true,
    });
    const head2Best = makeMorphField({
      id: 'c',
      morphId: 'morph-2',
      isSystem: false,
    });
    const head2Dup = makeMorphField({
      id: 'd',
      morphId: 'morph-2',
      isSystem: true,
    });

    const result = filterMorphRelationDuplicateFields({
      flatFieldMetadatas: [head1Dup, head2Dup, head1Best, head2Best],
      isMorphRelationHeadEnabled: false,
    });

    expect(result).toHaveLength(2);
    expect(result).toContain(head1Best);
    expect(result).toContain(head2Best);
  });

  it('should return empty array for empty input', () => {
    expect(
      filterMorphRelationDuplicateFields({
        flatFieldMetadatas: [],
        isMorphRelationHeadEnabled: false,
      }),
    ).toEqual([]);
  });

  describe('with a persisted morph relation head', () => {
    const head = makeMorphField({
      id: 'head',
      morphId: 'morph-1',
      universalIdentifier: 'morph-1',
    });
    const target = makeMorphField({
      id: 'target',
      morphId: 'morph-1',
      universalIdentifier: 'target',
    });

    it.each([
      ['the survivor while disabled', [head, target], false, [target]],
      ['the head while enabled', [target, head], true, [head]],
      ['nothing for targets without a head while enabled', [target], true, []],
      ['nothing for an empty head while disabled', [head], false, []],
    ])(
      'should return %s',
      (_, flatFieldMetadatas, isMorphRelationHeadEnabled, expected) => {
        expect(
          filterMorphRelationDuplicateFields({
            flatFieldMetadatas,
            isMorphRelationHeadEnabled,
          }),
        ).toEqual(expected);
      },
    );
  });
});
