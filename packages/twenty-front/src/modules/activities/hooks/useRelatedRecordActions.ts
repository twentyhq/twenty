import { useComposeCalendarEventRelatedRecordAction } from '@/activities/calendar/hooks/useComposeCalendarEventRelatedRecordAction';
import { useComposeEmailRelatedRecordAction } from '@/activities/emails/hooks/useComposeEmailRelatedRecordAction';
import { useAttachFileRelatedRecordAction } from '@/activities/files/hooks/useAttachFileRelatedRecordAction';
import { useCreateActivityRelatedRecordAction } from '@/activities/hooks/useCreateActivityRelatedRecordAction';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type RelatedRecordActionBinding } from '@/activities/types/RelatedRecordAction';
import { CoreObjectNameSingular } from 'twenty-shared/types';

type UseRelatedRecordActionsParams = {
  targetRecord: ActivityTargetableObject;
  onFileUploadComplete?: () => void;
};

export const useRelatedRecordActions = ({
  targetRecord,
  onFileUploadComplete,
}: UseRelatedRecordActionsParams): RelatedRecordActionBinding[] => {
  const taskAction = useCreateActivityRelatedRecordAction({
    targetRecord,
    activityObjectNameSingular: CoreObjectNameSingular.Task,
  });
  const noteAction = useCreateActivityRelatedRecordAction({
    targetRecord,
    activityObjectNameSingular: CoreObjectNameSingular.Note,
  });
  const fileAction = useAttachFileRelatedRecordAction({
    targetRecord,
    onUploadComplete: onFileUploadComplete,
  });
  const emailAction = useComposeEmailRelatedRecordAction({ targetRecord });
  const calendarEventAction =
    useComposeCalendarEventRelatedRecordAction(targetRecord);

  return [taskAction, noteAction, fileAction, emailAction, calendarEventAction];
};
