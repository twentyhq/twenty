import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordReadOnly } from '@/object-record/read-only/utils/isRecordReadOnly';
import { useIsRecordDeleted } from '@/object-record/record-field/ui/hooks/useIsRecordDeleted';
import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

type UseIsMorphRelationReadOnlyFromRelatedRecordPerspectiveArgs = {
  recordId: string;
  sourceObjectMetadataId: string;
  fieldMetadata: FieldMorphRelationMetadata;
};

export const useIsMorphRelationReadOnlyFromRelatedRecordPerspective = ({
  recordId,
  sourceObjectMetadataId,
  fieldMetadata,
}: UseIsMorphRelationReadOnlyFromRelatedRecordPerspectiveArgs) => {
  const { relationType, morphRelations } = fieldMetadata;

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const isToOneObject = relationType === RelationType.MANY_TO_ONE;

  const isRecordReadOnlyFromSourcePerspective = useIsRecordReadOnly({
    recordId,
    objectMetadataId: sourceObjectMetadataId,
  });

  const relatedObjectMetadataItems = morphRelations
    .map((morphRelation) => morphRelation.targetObjectMetadata.id)
    .map((objectMetadataId) =>
      objectMetadataItems.find(
        (objectMetadataItem) => objectMetadataItem.id === objectMetadataId,
      ),
    )
    .filter(isDefined);

  const isDeleted = useIsRecordDeleted({ recordId });

  const isRecordReadOnlyFromTargetPerspective =
    relatedObjectMetadataItems.some((relatedObjectMetadataItem) => {
      const objectPermissions = getObjectPermissionsFromMapByObjectMetadataId({
        objectPermissionsByObjectMetadataId,
        objectMetadataId: relatedObjectMetadataItem.id,
      });

      return isRecordReadOnly({
        objectPermissions,
        isRecordDeleted: isDeleted,
        objectMetadataItem: relatedObjectMetadataItem,
      });
    });

  return isToOneObject
    ? isRecordReadOnlyFromSourcePerspective
    : isRecordReadOnlyFromTargetPerspective;
};
