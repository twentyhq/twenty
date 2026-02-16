import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

// Prefers active non-system fields (standard targets) over system ones
// (auto-created for custom objects). Smallest id breaks ties.
const scoreMorphField = (
  field: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>,
): number => (field.isActive ? 2 : 0) + (field.isSystem ? 0 : 1);

export const pickMorphGroupSurvivor = (
  group: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[],
): FlatFieldMetadata<FieldMetadataType.MORPH_RELATION> => {
  return group.reduce((best, current) => {
    const diff = scoreMorphField(current) - scoreMorphField(best);

    return diff > 0 || (diff === 0 && current.id < best.id) ? current : best;
  });
};
