import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getTargetObjectMetadataIdsFromField = (
  field: FieldMetadataItem,
): string[] => {
  // Check morphRelations first - fields with morphId may have this populated
  if (isDefined(field.morphRelations) && field.morphRelations.length > 0) {
    return field.morphRelations
      .map((morphRelation) => morphRelation.targetObjectMetadata.id)
      .filter(isDefined);
  }

  // Fallback to regular relation
  const targetId = field.relation?.targetObjectMetadata.id;
  return targetId ? [targetId] : [];
};

