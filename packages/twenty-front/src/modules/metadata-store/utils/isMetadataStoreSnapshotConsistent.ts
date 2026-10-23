import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { type FlatIndexMetadataItem } from '@/metadata-store/types/FlatIndexMetadataItem';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { type FlatView } from '@/metadata-store/types/FlatView';
import { isDefined } from 'twenty-shared/utils';

export type MetadataStoreSnapshot = {
  objectMetadataItems: Pick<FlatObjectMetadataItem, 'id'>[];
  fieldMetadataItems: Pick<
    FlatFieldMetadataItem,
    'objectMetadataId' | 'relation' | 'morphRelations'
  >[];
  indexMetadataItems: Pick<FlatIndexMetadataItem, 'objectMetadataId'>[];
  views: Pick<FlatView, 'objectMetadataId'>[];
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
