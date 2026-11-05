import { useCreateActivityForTargetRecord } from '@/activities/hooks/useCreateActivityForTargetRecord';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type RelatedRecordActionBinding } from '@/activities/types/RelatedRecordAction';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { IconCheckbox, IconNotes } from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';

type UseCreateActivityRelatedRecordActionParams = {
  targetRecord: ActivityTargetableObject;
  activityObjectNameSingular:
    | StandardObjectNameSingular.Note
    | StandardObjectNameSingular.Task;
};

export const useCreateActivityRelatedRecordAction = ({
  targetRecord,
  activityObjectNameSingular,
}: UseCreateActivityRelatedRecordActionParams): RelatedRecordActionBinding => {
  const { t } = useLingui();
  const { canCreateActivity, createActivity } =
    useCreateActivityForTargetRecord({
      targetRecord,
      activityObjectNameSingular,
    });

  const isTask = activityObjectNameSingular === StandardObjectNameSingular.Task;

  return {
    action: {
      id: isTask ? 'create-task' : 'create-note',
      label: isTask ? t`Create task` : t`Create note`,
      Icon: isTask ? IconCheckbox : IconNotes,
      isVisible: canCreateActivity,
      disabled: false,
      execute: createActivity,
    },
  };
};
