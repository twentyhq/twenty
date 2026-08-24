import { useCanUploadAttachmentFiles } from '@/activities/files/hooks/useCanUploadAttachmentFiles';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useCanUpdateObjectRecords } from '@/object-record/hooks/useCanUpdateObjectRecords';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useHasAnyRelatedRecordAction = (
  targetRecord: ActivityTargetableObject,
) => {
  const { canUpdateObjectRecords } = useCanUpdateObjectRecords(
    targetRecord.targetObjectNameSingular,
  );
  const { canUploadFiles } = useCanUploadAttachmentFiles(targetRecord);
  const hasSendEmailPermission = useHasPermissionFlag(
    PermissionFlagType.SEND_EMAIL_TOOL,
  );
  const hasCreateCalendarEventPermission = useHasPermissionFlag(
    PermissionFlagType.CREATE_CALENDAR_EVENT_TOOL,
  );

  return (
    canUpdateObjectRecords ||
    canUploadFiles ||
    hasSendEmailPermission ||
    hasCreateCalendarEventPermission
  );
};
