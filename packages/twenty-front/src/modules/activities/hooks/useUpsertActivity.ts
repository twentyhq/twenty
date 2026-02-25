import { useCreateActivityInDB } from '@/activities/hooks/useCreateActivityInDB';
import { useRefreshShowPageFindManyActivitiesQueries } from '@/activities/hooks/useRefreshShowPageFindManyActivitiesQueries';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { objectShowPageTargetableObjectStateV2 } from '@/activities/timeline-activities/states/objectShowPageTargetableObjectStateV2';
import { type Note } from '@/activities/types/Note';
import { type Task } from '@/activities/types/Task';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { isDefined } from 'twenty-shared/utils';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useUpsertActivity = ({
  activityObjectNameSingular,
}: {
  activityObjectNameSingular:
    | CoreObjectNameSingular.Task
    | CoreObjectNameSingular.Note;
}) => {
  const [isActivityInCreateMode] = useAtomState(isActivityInCreateModeState);

  const { updateOneRecord: updateOneActivity } = useUpdateOneRecord();

  const { createActivityInDB } = useCreateActivityInDB({
    activityObjectNameSingular,
  });

  const [, setIsUpsertingActivityInDB] = useAtomState(
    isUpsertingActivityInDBState,
  );

  const objectShowPageTargetableObject = useAtomStateValue(
    objectShowPageTargetableObjectStateV2,
  );

  const { refreshShowPageFindManyActivitiesQueries } =
    useRefreshShowPageFindManyActivitiesQueries({
      activityObjectNameSingular,
    });

  const upsertActivity = async ({
    activity,
    input,
  }: {
    activity: Task | Note;
    input: Partial<Task | Note>;
  }) => {
    setIsUpsertingActivityInDB(true);
    if (isActivityInCreateMode) {
      const activityToCreate: Partial<Task | Note> = {
        ...activity,
        ...input,
      };

      if (isDefined(objectShowPageTargetableObject)) {
        refreshShowPageFindManyActivitiesQueries();
      }

      await createActivityInDB(activityToCreate);
    } else {
      await updateOneActivity?.({
        objectNameSingular: activityObjectNameSingular,
        idToUpdate: activity.id,
        updateOneRecordInput: input,
      });
    }

    setIsUpsertingActivityInDB(false);
  };

  return {
    upsertActivity,
  };
};
