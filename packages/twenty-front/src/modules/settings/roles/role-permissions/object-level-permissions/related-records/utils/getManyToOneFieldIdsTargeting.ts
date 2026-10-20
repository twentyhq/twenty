import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';

// Each morph target keeps its own server field, merged into one on the client
export const getManyToOneFieldIdsTargeting = ({
  fieldMetadataItem,
  targetObjectMetadataId,
}: {
  fieldMetadataItem: FieldMetadataItem;
  targetObjectMetadataId: string;
}): string[] => {
  if (fieldMetadataItem.isActive === false) {
    return [];
  }

  if (fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION) {
    return (fieldMetadataItem.morphRelations ?? [])
      .filter(
        (morphRelation) =>
          morphRelation.type === RelationType.MANY_TO_ONE &&
          morphRelation.targetObjectMetadata.id === targetObjectMetadataId,
      )
      .map((morphRelation) => morphRelation.sourceFieldMetadata.id);
  }

  if (
    fieldMetadataItem.type !== FieldMetadataType.RELATION ||
    fieldMetadataItem.relation?.type !== RelationType.MANY_TO_ONE
  ) {
    return [];
  }

  return fieldMetadataItem.relation.targetObjectMetadata.id ===
    targetObjectMetadataId
    ? [fieldMetadataItem.id]
    : [];
};
