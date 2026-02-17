import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { pickMorphGroupSurvivor } from 'src/engine/dataloaders/utils/pick-morph-group-survivor.util';

const makeMorphField = (
  overrides: Partial<FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>> & {
    id: string;
  },
): FlatFieldMetadata<FieldMetadataType.MORPH_RELATION> =>
  ({
    type: FieldMetadataType.MORPH_RELATION,
    isActive: true,
    isSystem: false,
    morphId: 'morph-1',
    ...overrides,
  }) as FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;

describe('pickMorphGroupSurvivor', () => {
  it('should return the only field when group has one element', () => {
    const field = makeMorphField({ id: 'a' });

    expect(pickMorphGroupSurvivor([field])).toBe(field);
  });

  it('should prefer active non-system over active system', () => {
    const standard = makeMorphField({
      id: 'b',
      isActive: true,
      isSystem: false,
    });
    const system = makeMorphField({
      id: 'a',
      isActive: true,
      isSystem: true,
    });

    expect(pickMorphGroupSurvivor([system, standard])).toBe(standard);
  });

  it('should prefer active over inactive', () => {
    const active = makeMorphField({
      id: 'b',
      isActive: true,
      isSystem: true,
    });
    const inactive = makeMorphField({
      id: 'a',
      isActive: false,
      isSystem: false,
    });

    expect(pickMorphGroupSurvivor([inactive, active])).toBe(active);
  });

  it('should break ties by smallest id', () => {
    const fieldA = makeMorphField({
      id: 'aaa',
      isActive: true,
      isSystem: false,
    });
    const fieldB = makeMorphField({
      id: 'bbb',
      isActive: true,
      isSystem: false,
    });

    expect(pickMorphGroupSurvivor([fieldB, fieldA])).toBe(fieldA);
  });

  it('should prefer active+non-system (score 3) over inactive+non-system (score 1)', () => {
    const best = makeMorphField({
      id: 'z',
      isActive: true,
      isSystem: false,
    });
    const worse = makeMorphField({
      id: 'a',
      isActive: false,
      isSystem: false,
    });

    expect(pickMorphGroupSurvivor([worse, best])).toBe(best);
  });
});
