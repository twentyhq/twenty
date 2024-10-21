import { useRecoilState, useRecoilValue } from 'recoil';

import { useCreateActivityInDB } from '@/activities/hooks/useCreateActivityInDB';
import { useRefreshShowPageFindManyActivitiesQueries } from '@/activities/hooks/useRefreshShowPageFindManyActivitiesQueries';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { objectShowPageTargetableObjectState } from '@/activities/timeline-activities/states/objectShowPageTargetableObjectIdState';
import { Note } from '@/activities/types/Note';
import { Task } from '@/activities/types/Task';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { isDefined } from '~/utils/isDefined';

export const useUpsertActivity = ({
  activityObjectNameSingular,
}: {
  activityObjectNameSingular:
    | CoreObjectNameSingular.Task
    | CoreObjectNameSingular.Note;
}) => {
  const [isActivityInCreateMode] = useRecoilState(isActivityInCreateModeState);

  const { updateOneRecord: updateOneActivity } = useUpdateOneRecord<
    Task | Note
  >({
    objectNameSingular: activityObjectNameSingular,
  });

  const { createActivityInDB } = useCreateActivityInDB({
    activityObjectNameSingular,
  });

  const [, setIsUpsertingActivityInDB] = useRecoilState(
    isUpsertingActivityInDBState,
  );

  const objectShowPageTargetableObject = useRecoilValue(
    objectShowPageTargetableObjectState,
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
