import { useApolloClient } from '@apollo/client';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useCreateActivityInDB } from '@/activities/hooks/useCreateActivityInDB';
import { activityInDrawerState } from '@/activities/states/activityInDrawerState';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { useInjectIntoTimelineActivitiesQueries } from '@/activities/timeline/hooks/useInjectIntoTimelineActivitiesQueries';
import { timelineTargetableObjectState } from '@/activities/timeline/states/timelineTargetableObjectState';
import { Activity } from '@/activities/types/Activity';
import { useActivityConnectionUtils } from '@/activities/utils/useActivityConnectionUtils';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

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

  const setActivityInDrawer = useSetRecoilState(activityInDrawerState);

  const timelineTargetableObject = useRecoilValue(
    timelineTargetableObjectState,
  );

  const { injectIntoTimelineActivitiesQueries } =
    useInjectIntoTimelineActivitiesQueries();

  const { makeActivityWithConnection } = useActivityConnectionUtils();

  const apolloClient = useApolloClient();

  const upsertActivity = async ({
    activity,
    input,
  }: {
    activity: Activity;
    input: Partial<Activity>;
  }) => {
    setIsUpsertingActivityInDB(true);

    if (isActivityInCreateMode) {
      const activityToCreate: Activity = {
        ...activity,
        ...input,
      };

      const { activityWithConnection } =
        makeActivityWithConnection(activityToCreate);

      // Call optimistic effects
      if (timelineTargetableObject) {
        injectIntoTimelineActivitiesQueries({
          timelineTargetableObject: timelineTargetableObject,
          activityToInject: activityWithConnection,
          activityTargetsToInject: activityToCreate.activityTargets,
        });
      }

      await createActivityInDB(activityToCreate);

      await apolloClient.refetchQueries({
        include: ['FindManyActivities', 'FindManyActivityTargets'],
      });

      setActivityInDrawer(activityToCreate);

      setIsActivityInCreateMode(false);
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
