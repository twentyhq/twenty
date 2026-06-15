import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

// A morph relation is stored as one field metadata per target object, all
// sharing a `morphId`. The server collapses them into a single field before
// exposing them, but the client can transiently hold every sub-field (e.g. right
// after a morph field is created, before the metadata settles). Field pickers
// that list available view fields must collapse them too — otherwise a morph
// relation shows up once per target and the user can add duplicate columns that
// reference non-survivor sub-fields. Those columns then vanish on refresh, once
// the metadata settles back to the single survivor.
//
// The survivor selection mirrors the server (pick-morph-group-survivor.util.ts):
// prefer active, non-system fields, then the smallest id, so the client and the
// server agree on which sub-field id represents the morph relation.
const scoreMorphField = (fieldMetadataItem: FieldMetadataItem): number =>
  (fieldMetadataItem.isActive ? 2 : 0) + (fieldMetadataItem.isSystem ? 0 : 1);

const isBetterMorphSurvivor = (
  candidate: FieldMetadataItem,
  current: FieldMetadataItem,
): boolean => {
  const scoreDifference = scoreMorphField(candidate) - scoreMorphField(current);

  return (
    scoreDifference > 0 ||
    (scoreDifference === 0 && candidate.id < current.id)
  );
};

export const dedupeMorphRelationFieldMetadataItems = (
  fieldMetadataItems: FieldMetadataItem[],
): FieldMetadataItem[] => {
  const survivorByMorphId = new Map<string, FieldMetadataItem>();

  for (const fieldMetadataItem of fieldMetadataItems) {
    if (
      fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION ||
      !isDefined(fieldMetadataItem.morphId)
    ) {
      continue;
    }

    const currentSurvivor = survivorByMorphId.get(fieldMetadataItem.morphId);

    if (
      !isDefined(currentSurvivor) ||
      isBetterMorphSurvivor(fieldMetadataItem, currentSurvivor)
    ) {
      survivorByMorphId.set(fieldMetadataItem.morphId, fieldMetadataItem);
    }
  }

  return fieldMetadataItems.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION ||
      !isDefined(fieldMetadataItem.morphId) ||
      survivorByMorphId.get(fieldMetadataItem.morphId)?.id ===
        fieldMetadataItem.id,
  );
};
