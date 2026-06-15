import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, pickMorphGroupSurvivor } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

// A morph relation is stored as one field metadata per target object, all
// sharing a `morphId`. The server collapses them into a single field before
// exposing them, but the client can transiently hold every sub-field (e.g. the
// SSE metadata sync pushes one raw row per created field). Field pickers that
// list available view fields must collapse them too — otherwise a morph relation
// shows up once per target and the user can add duplicate columns that reference
// non-survivor sub-fields. Those columns then vanish on refresh, once the
// metadata settles back to the single survivor.
//
// `pickMorphGroupSurvivor` is shared with the server so both agree on which
// sub-field id represents the morph relation.
export const dedupeMorphRelationFieldMetadataItems = (
  fieldMetadataItems: FieldMetadataItem[],
): FieldMetadataItem[] => {
  const morphGroupsByMorphId = new Map<string, FieldMetadataItem[]>();

  for (const fieldMetadataItem of fieldMetadataItems) {
    if (
      fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION ||
      !isDefined(fieldMetadataItem.morphId)
    ) {
      continue;
    }

    const group = morphGroupsByMorphId.get(fieldMetadataItem.morphId) ?? [];

    group.push(fieldMetadataItem);
    morphGroupsByMorphId.set(fieldMetadataItem.morphId, group);
  }

  const survivorIdByMorphId = new Map<string, string>();

  for (const [morphId, group] of morphGroupsByMorphId) {
    survivorIdByMorphId.set(morphId, pickMorphGroupSurvivor(group).id);
  }

  return fieldMetadataItems.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION ||
      !isDefined(fieldMetadataItem.morphId) ||
      survivorIdByMorphId.get(fieldMetadataItem.morphId) ===
        fieldMetadataItem.id,
  );
};
