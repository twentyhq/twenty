import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, pickMorphGroupSurvivor } from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

type DedupableMorphFieldMetadataItem = Pick<
  FieldMetadataItem,
  'id' | 'type' | 'morphId' | 'isActive' | 'isSystem'
>;

export const dedupeMorphRelationFieldMetadataItems = <
  T extends DedupableMorphFieldMetadataItem,
>(
  fieldMetadataItems: T[],
): T[] => {
  const morphGroupsByMorphId = new Map<string, T[]>();

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
