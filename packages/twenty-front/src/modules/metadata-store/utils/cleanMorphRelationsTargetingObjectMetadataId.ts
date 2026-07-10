import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const cleanMorphRelationsTargetingObjectMetadataId = (
  fieldMetadataItems: FlatFieldMetadataItem[],
  deletedObjectMetadataId: string,
): FlatFieldMetadataItem[] => {
  const cleanedFieldMetadataItems: FlatFieldMetadataItem[] = [];

  for (const fieldMetadataItem of fieldMetadataItems) {
    const morphRelations = fieldMetadataItem.morphRelations;

    if (
      !isDefined(morphRelations) ||
      !morphRelations.some(
        (morphRelation) =>
          morphRelation.targetObjectMetadata.id === deletedObjectMetadataId,
      )
    ) {
      continue;
    }

    cleanedFieldMetadataItems.push({
      ...fieldMetadataItem,
      morphRelations: morphRelations.filter(
        (morphRelation) =>
          morphRelation.targetObjectMetadata.id !== deletedObjectMetadataId,
      ),
    });
  }

  return cleanedFieldMetadataItems;
};
