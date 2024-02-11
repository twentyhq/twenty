import { useRecoilState } from 'recoil';

import { useCreateActivityInDB } from '@/activities/hooks/useCreateActivityInDB';
import { isCreatingActivityState } from '@/activities/states/isCreatingActivityState';
import { Activity } from '@/activities/types/Activity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

export const useUpsertActivity = () => {
  const [isCreatingActivity, setIsCreatingActivity] = useRecoilState(
    isCreatingActivityState,
  );

  const { updateOneRecord: updateOneActivity } = useUpdateOneRecord<Activity>({
    objectNameSingular: CoreObjectNameSingular.Activity,
  });

  const { createActivityInDB } = useCreateActivityInDB();

  const upsertActivity = ({
    activity,
    input,
  }: {
    activity: Activity;
    input: Partial<Activity>;
  }) => {
    if (isCreatingActivity) {
      createActivityInDB({
        ...activity,
        ...input,
      });

      setIsCreatingActivity(false);
    } else {
      updateOneActivity?.({
        idToUpdate: activity.id,
        updateOneRecordInput: input,
      });
    }
  };

  return {
    upsertActivity,
  };
};
