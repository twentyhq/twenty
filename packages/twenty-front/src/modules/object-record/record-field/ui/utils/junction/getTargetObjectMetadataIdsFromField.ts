import { isDefined } from 'twenty-shared/utils';

type RelationWithOptionalTargetId = {
  targetObjectMetadata: { id?: string };
};

export const getTargetObjectMetadataIdsFromField = (field: {
  morphRelations?: RelationWithOptionalTargetId[] | null;
  relation?: RelationWithOptionalTargetId | null;
}): string[] => {
  if (isDefined(field.morphRelations) && field.morphRelations.length > 0) {
    return field.morphRelations
      .map((morphRelation) => morphRelation.targetObjectMetadata.id)
      .filter(isDefined);
  }

  const targetId = field.relation?.targetObjectMetadata.id;
  return targetId ? [targetId] : [];
};
