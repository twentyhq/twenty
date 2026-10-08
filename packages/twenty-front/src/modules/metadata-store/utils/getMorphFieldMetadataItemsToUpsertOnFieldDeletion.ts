import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isNonEmptyArray,
  pickMorphGroupSurvivorOrThrow,
} from 'twenty-shared/utils';

// The server collapses each morph group into one field carrying the id of a single sibling row,
// while deletions arrive one row at a time. Removing that row must hand the group over to a
// remaining sibling instead of dropping the whole morph relation from the store.
export const getMorphFieldMetadataItemsToUpsertOnFieldDeletion = (
  fieldMetadataItems: FlatFieldMetadataItem[],
  deletedFieldMetadataId: string,
): FlatFieldMetadataItem[] => {
  const fieldMetadataItemsToUpsert: FlatFieldMetadataItem[] = [];

  for (const fieldMetadataItem of fieldMetadataItems) {
    if (
      fieldMetadataItem.id === deletedFieldMetadataId ||
      !isDefined(fieldMetadataItem.morphRelations) ||
      !fieldMetadataItem.morphRelations.some(
        ({ sourceFieldMetadata }) =>
          sourceFieldMetadata.id === deletedFieldMetadataId,
      )
    ) {
      continue;
    }

    fieldMetadataItemsToUpsert.push({
      ...fieldMetadataItem,
      morphRelations: fieldMetadataItem.morphRelations.filter(
        ({ sourceFieldMetadata }) =>
          sourceFieldMetadata.id !== deletedFieldMetadataId,
      ),
    });
  }

  const deletedFieldMetadataItem = fieldMetadataItems.find(
    ({ id }) => id === deletedFieldMetadataId,
  );

  if (
    deletedFieldMetadataItem?.type !== FieldMetadataType.MORPH_RELATION ||
    !isDefined(deletedFieldMetadataItem.morphId)
  ) {
    return fieldMetadataItemsToUpsert;
  }

  const isMorphGroupStillInStore = fieldMetadataItems.some(
    (fieldMetadataItem) =>
      fieldMetadataItem.id !== deletedFieldMetadataId &&
      fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION &&
      fieldMetadataItem.objectMetadataId ===
        deletedFieldMetadataItem.objectMetadataId &&
      fieldMetadataItem.morphId === deletedFieldMetadataItem.morphId,
  );

  const remainingMorphRelations = (
    deletedFieldMetadataItem.morphRelations ?? []
  ).filter(
    ({ sourceFieldMetadata }) =>
      sourceFieldMetadata.id !== deletedFieldMetadataId,
  );

  if (isMorphGroupStillInStore || !isNonEmptyArray(remainingMorphRelations)) {
    return fieldMetadataItemsToUpsert;
  }

  // Siblings are only known through morphRelations, so they share the deleted row's flags and the
  // shared survivor rule falls back to the same id tie-break the server uses
  const survivor = pickMorphGroupSurvivorOrThrow(
    remainingMorphRelations.map(({ sourceFieldMetadata }) => ({
      id: sourceFieldMetadata.id,
      isActive: deletedFieldMetadataItem.isActive,
      isSystem: deletedFieldMetadataItem.isSystem,
    })),
  );

  return [
    ...fieldMetadataItemsToUpsert,
    {
      ...deletedFieldMetadataItem,
      id: survivor.id,
      morphRelations: remainingMorphRelations,
    },
  ];
};
