import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useCanUploadAttachmentFiles = (
  targetableObject: ActivityTargetableObject,
) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetableObject.targetObjectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasUploadPermission = useHasPermissionFlag(
    PermissionFlagType.UPLOAD_FILE,
  );

  return {
    canUploadFiles:
      objectPermissions.canUpdateObjectRecords && hasUploadPermission,
  };
};
