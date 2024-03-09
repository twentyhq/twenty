import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useActivityConnectionUtils } from '@/activities/hooks/useActivityConnectionUtils';
import { useCreateActivityInDB } from '@/activities/hooks/useCreateActivityInDB';
import { useInjectIntoActivitiesQueries } from '@/activities/hooks/useInjectIntoActivitiesQueries';
import { useInjectIntoActivityTargetsQueries } from '@/activities/hooks/useInjectIntoActivityTargetsQueries';
import { currentNotesQueryVariablesState } from '@/activities/notes/states/currentNotesQueryVariablesState';
import { activityIdInDrawerState } from '@/activities/states/activityIdInDrawerState';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { currentCompletedTaskQueryVariablesState } from '@/activities/tasks/states/currentCompletedTaskQueryVariablesState';
import { currentIncompleteTaskQueryVariablesState } from '@/activities/tasks/states/currentIncompleteTaskQueryVariablesState';
import { useInjectIntoTimelineActivitiesQueries } from '@/activities/timeline/hooks/useInjectIntoTimelineActivitiesQueries';
import { objectShowPageTargetableObjectState } from '@/activities/timeline/states/objectShowPageTargetableObjectIdState';
import { Activity } from '@/activities/types/Activity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { isNonNullable } from '~/utils/isNonNullable';

// TODO: create a generic way to have records only in cache for create mode and delete them afterwards ?
export const useUpsertActivity = () => {
  const [isActivityInCreateMode, setIsActivityInCreateMode] = useRecoilState(
    isActivityInCreateModeState(),
  );

  const { updateOneRecord: updateOneActivity } = useUpdateOneRecord<Activity>({
    objectNameSingular: CoreObjectNameSingular.Activity,
  });

  const { createActivityInDB } = useCreateActivityInDB();

  const [, setIsUpsertingActivityInDB] = useRecoilState(
    isUpsertingActivityInDBState(),
  );

  const setActivityIdInDrawer = useSetRecoilState(activityIdInDrawerState());

  const objectShowPageTargetableObject = useRecoilValue(
    objectShowPageTargetableObjectState,
  );

  const { injectActivitiesQueries } = useInjectIntoActivitiesQueries();
  const { injectActivityTargetsQueries } =
    useInjectIntoActivityTargetsQueries();

  const { pathname } = useLocation();

  const weAreOnObjectShowPage = pathname.startsWith('/object');
  const weAreOnTaskPage = pathname.startsWith('/tasks');

  const { injectIntoTimelineActivitiesQueries } =
    useInjectIntoTimelineActivitiesQueries();

  const { makeActivityWithConnection } = useActivityConnectionUtils();

  const currentCompletedTaskQueryVariables = useRecoilValue(
    currentCompletedTaskQueryVariablesState,
  );

  const currentIncompleteTaskQueryVariables = useRecoilValue(
    currentIncompleteTaskQueryVariablesState,
  );

  const currentNotesQueryVariables = useRecoilValue(
    currentNotesQueryVariablesState,
  );

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

      if (weAreOnTaskPage) {
        if (isNonNullable(activityWithConnection.completedAt)) {
          injectActivitiesQueries({
            activitiesFilters: currentCompletedTaskQueryVariables?.filter,
            activitiesOrderByVariables:
              currentCompletedTaskQueryVariables?.orderBy,
            activityTargetsToInject: activityToCreate.activityTargets,
            activityToInject: activityWithConnection,
            targetableObjects: [],
          });
        } else {
          injectActivitiesQueries({
            activitiesFilters: currentIncompleteTaskQueryVariables?.filter,
            activitiesOrderByVariables:
              currentIncompleteTaskQueryVariables?.orderBy,
            activityTargetsToInject: activityToCreate.activityTargets,
            activityToInject: activityWithConnection,
            targetableObjects: [],
          });
        }

        injectActivityTargetsQueries({
          activityTargetsToInject: activityToCreate.activityTargets,
          targetableObjects: [],
        });
      }

      // Call optimistic effects
      if (
        weAreOnObjectShowPage &&
        isNonNullable(objectShowPageTargetableObject)
      ) {
        injectIntoTimelineActivitiesQueries({
          timelineTargetableObject: objectShowPageTargetableObject,
          activityToInject: activityWithConnection,
          activityTargetsToInject: activityToCreate.activityTargets,
        });

        const injectOnlyInIdFilterForTaskQueries =
          activityWithConnection.type !== 'Task';

        const injectOnlyInIdFilterForNotesQueries =
          activityWithConnection.type !== 'Note';

        if (isNonNullable(currentCompletedTaskQueryVariables)) {
          injectActivitiesQueries({
            activitiesFilters: currentCompletedTaskQueryVariables?.filter,
            activitiesOrderByVariables:
              currentCompletedTaskQueryVariables?.orderBy,
            activityTargetsToInject: activityToCreate.activityTargets,
            activityToInject: activityWithConnection,
            targetableObjects: [objectShowPageTargetableObject],
            injectOnlyInIdFilter: injectOnlyInIdFilterForTaskQueries,
          });
        }

        if (isNonNullable(currentIncompleteTaskQueryVariables)) {
          injectActivitiesQueries({
            activitiesFilters:
              currentIncompleteTaskQueryVariables?.filter ?? {},
            activitiesOrderByVariables:
              currentIncompleteTaskQueryVariables?.orderBy ?? {},
            activityTargetsToInject: activityToCreate.activityTargets,
            activityToInject: activityWithConnection,
            targetableObjects: [objectShowPageTargetableObject],
            injectOnlyInIdFilter: injectOnlyInIdFilterForTaskQueries,
          });
        }

        if (isNonNullable(currentNotesQueryVariables)) {
          injectActivitiesQueries({
            activitiesFilters: currentNotesQueryVariables?.filter,
            activitiesOrderByVariables: currentNotesQueryVariables?.orderBy,
            activityTargetsToInject: activityToCreate.activityTargets,
            activityToInject: activityWithConnection,
            targetableObjects: [objectShowPageTargetableObject],
            injectOnlyInIdFilter: injectOnlyInIdFilterForNotesQueries,
          });
        }

        injectActivityTargetsQueries({
          activityTargetsToInject: activityToCreate.activityTargets,
          targetableObjects: [objectShowPageTargetableObject],
        });
      }

      await createActivityInDB(activityToCreate);

      setActivityIdInDrawer(activityToCreate.id);

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
