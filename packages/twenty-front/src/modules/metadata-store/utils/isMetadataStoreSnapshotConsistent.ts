import { isDefined } from 'twenty-shared/utils';

type ObjectMetadataReference = { targetObjectMetadata: { id: string } };

export type MetadataStoreSnapshot = {
  objectMetadataItems: { id: string }[];
  fieldMetadataItems: {
    objectMetadataId: string;
    relation?: ObjectMetadataReference | null;
    morphRelations?: ObjectMetadataReference[] | null;
  }[];
  indexMetadataItems: { objectMetadataId: string }[];
  views: { objectMetadataId: string }[];
};

export const isMetadataStoreSnapshotConsistent = ({
  objectMetadataItems,
  fieldMetadataItems,
  indexMetadataItems,
  views,
}: MetadataStoreSnapshot): boolean => {
  const objectMetadataIds = new Set(
    objectMetadataItems.map((objectMetadataItem) => objectMetadataItem.id),
  );

  const areFieldsConsistent = fieldMetadataItems.every(
    (fieldMetadataItem) =>
      objectMetadataIds.has(fieldMetadataItem.objectMetadataId) &&
      (!isDefined(fieldMetadataItem.relation) ||
        objectMetadataIds.has(
          fieldMetadataItem.relation.targetObjectMetadata.id,
        )) &&
      (fieldMetadataItem.morphRelations ?? []).every((morphRelation) =>
        objectMetadataIds.has(morphRelation.targetObjectMetadata.id),
      ),
  );

  return (
    areFieldsConsistent &&
    indexMetadataItems.every((indexMetadataItem) =>
      objectMetadataIds.has(indexMetadataItem.objectMetadataId),
    ) &&
    views.every((view) => objectMetadataIds.has(view.objectMetadataId))
  );
};
