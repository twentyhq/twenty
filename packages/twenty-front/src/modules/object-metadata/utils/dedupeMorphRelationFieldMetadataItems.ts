import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, pickMorphGroupSurvivorOrThrow } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

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
    survivorIdByMorphId.set(morphId, pickMorphGroupSurvivorOrThrow(group).id);
  }

  return fieldMetadataItems.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION ||
      !isDefined(fieldMetadataItem.morphId) ||
      survivorIdByMorphId.get(fieldMetadataItem.morphId) ===
        fieldMetadataItem.id,
  );
};
