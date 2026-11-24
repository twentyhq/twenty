import { useAttachmentTargetJoinColumnName } from '@/activities/files/hooks/useAttachmentTargetJoinColumnName';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useCanUpdateObjectRecords } from '@/object-record/hooks/useCanUpdateObjectRecords';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { isDefined } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useCanUploadAttachmentFiles = (
  targetableObject: ActivityTargetableObject,
) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetableObject.targetObjectNameSingular,
  });
  const { canUpdateSomeRecords } = useCanUpdateObjectRecords(
    targetableObject.targetObjectNameSingular,
  );

  const hasUploadPermission = useHasPermissionFlag(
    PermissionFlagType.UPLOAD_FILE,
  );

  const attachmentTargetJoinColumnName = useAttachmentTargetJoinColumnName(
    targetableObject.targetObjectNameSingular,
  );

  return {
    canUploadFiles:
      isDefined(attachmentTargetJoinColumnName) &&
      canUpdateSomeRecords &&
      hasUploadPermission &&
      !isObjectMetadataReadOnly({ objectMetadataItem }),
  };
};
