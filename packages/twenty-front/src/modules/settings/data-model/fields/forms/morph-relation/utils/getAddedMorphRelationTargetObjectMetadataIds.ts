type SavedMorphRelation = { targetObjectMetadata: { id: string } };

export const getAddedMorphRelationTargetObjectMetadataIds = ({
  savedMorphRelations,
  selectedObjectMetadataIds = [],
}: {
  savedMorphRelations?: SavedMorphRelation[] | null;
  selectedObjectMetadataIds?: string[];
}) => {
  const savedObjectMetadataIds = (savedMorphRelations ?? []).map(
    (morphRelation) => morphRelation.targetObjectMetadata.id,
  );

  return [...new Set(selectedObjectMetadataIds)].filter(
    (objectMetadataId) => !savedObjectMetadataIds.includes(objectMetadataId),
  );
};
