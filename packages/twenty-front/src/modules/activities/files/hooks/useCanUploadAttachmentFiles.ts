import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useCanUpdateObjectRecords } from '@/object-record/hooks/useCanUpdateObjectRecords';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useCanUploadAttachmentFiles = (
  targetableObject: ActivityTargetableObject,
) => {
  const { canUpdateObjectRecords } = useCanUpdateObjectRecords(
    targetableObject.targetObjectNameSingular,
  );

  const hasUploadPermission = useHasPermissionFlag(
    PermissionFlagType.UPLOAD_FILE,
  );

  return {
    canUploadFiles: canUpdateObjectRecords && hasUploadPermission,
  };
};
