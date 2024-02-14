import { useRecoilCallback, useRecoilState } from 'recoil';

import { useCreateActivityInDB } from '@/activities/hooks/useCreateActivityInDB';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { Activity } from '@/activities/types/Activity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

// TODO: create a generic way to have records only in cache for create mode and delete them afterwards ?
export const useUpsertActivity = () => {
  const [isActivityInCreateMode, setIsActivityInCreateMode] = useRecoilState(
    isActivityInCreateModeState,
  );

  const { updateOneRecord: updateOneActivity } = useUpdateOneRecord<Activity>({
    objectNameSingular: CoreObjectNameSingular.Activity,
  });

  const { createActivityInDB } = useCreateActivityInDB();

  const [, setIsUpsertingActivityInDB] = useRecoilState(
    isUpsertingActivityInDBState,
  );

  const upsertActivity = useRecoilCallback(
    ({ set }) =>
      async ({
        activity,
        input,
      }: {
        activity: Activity;
        input: Partial<Activity>;
      }) => {
        setIsUpsertingActivityInDB(true);

        if (isActivityInCreateMode) {
          await createActivityInDB({
            ...activity,
            ...input,
          });

          setIsActivityInCreateMode(false);
        } else {
          await updateOneActivity?.({
            idToUpdate: activity.id,
            updateOneRecordInput: input,
          });
        }

        set(recordStoreFamilyState(activity.id), {
          ...activity,
          ...input,
        });

        setIsUpsertingActivityInDB(false);
      },
    [
      createActivityInDB,
      isActivityInCreateMode,
      setIsActivityInCreateMode,
      setIsUpsertingActivityInDB,
      updateOneActivity,
    ],
  );

  return {
    upsertActivity,
  };
};
