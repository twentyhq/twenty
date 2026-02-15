import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

// Picks the best representative from a morph group.
// Prefers active non-system fields (standard targets) over system ones
// (auto-created for custom objects). Smallest id breaks ties.
const pickMorphGroupSurvivor = (
  group: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[],
): FlatFieldMetadata<FieldMetadataType.MORPH_RELATION> => {
  const score = (
    field: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>,
  ): number => (field.isActive ? 2 : 0) + (field.isSystem ? 0 : 1);

  return group.reduce((best, current) => {
    const diff = score(current) - score(best);

    return diff > 0 || (diff === 0 && current.id < best.id) ? current : best;
  });
};

export const filterMorphRelationDuplicateFields = (
  flatFieldMetadatas: FlatFieldMetadata[],
): FlatFieldMetadata[] => {
  const initialAccumulator: {
    morphFlatFieldMetadatas: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[];
    otherFlatFieldMetadatas: FlatFieldMetadata[];
  } = {
    morphFlatFieldMetadatas: [],
    otherFlatFieldMetadatas: [],
  };
  const { morphFlatFieldMetadatas, otherFlatFieldMetadatas } =
    flatFieldMetadatas.reduce((acc, flatFieldMetadata) => {
      if (
        isFlatFieldMetadataOfType(
          flatFieldMetadata,
          FieldMetadataType.MORPH_RELATION,
        )
      ) {
        return {
          ...acc,
          morphFlatFieldMetadatas: [
            ...acc.morphFlatFieldMetadatas,
            flatFieldMetadata,
          ],
        };
      }

      return {
        ...acc,
        otherFlatFieldMetadatas: [
          ...acc.otherFlatFieldMetadatas,
          flatFieldMetadata,
        ],
      };
    }, initialAccumulator);

  // Group morph fields by morphId
  const morphGroupsByMorphId = new Map<
    string,
    FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[]
  >();

  for (const morphField of morphFlatFieldMetadatas) {
    const existing = morphGroupsByMorphId.get(morphField.morphId) ?? [];

    morphGroupsByMorphId.set(morphField.morphId, [...existing, morphField]);
  }

  // Pick the best survivor from each group
  const survivorIds = new Set<string>();

  for (const group of morphGroupsByMorphId.values()) {
    const survivor = pickMorphGroupSurvivor(group);

    survivorIds.add(survivor.id);
  }

  const filteredMorphFlatFieldMetadatas = morphFlatFieldMetadatas.filter(
    (field) => survivorIds.has(field.id),
  );

  return [...otherFlatFieldMetadatas, ...filteredMorphFlatFieldMetadatas];
};
