import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

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
import { isDefined } from '~/utils/isDefined';

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

  const setActivityIdInDrawer = useSetRecoilState(activityIdInDrawerState);

  const objectShowPageTargetableObject = useRecoilValue(
    objectShowPageTargetableObjectState,
  );

  const { injectActivitiesQueries } = useInjectIntoActivitiesQueries();
  const { injectIntoActivityTargetsQueries } =
    useInjectIntoActivityTargetsQueries();

  const { pathname } = useLocation();

  const weAreOnObjectShowPage = pathname.startsWith('/object');
  const weAreOnTaskPage = pathname.startsWith('/tasks');

  const { injectIntoTimelineActivitiesQueries } =
    useInjectIntoTimelineActivitiesQueries();

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

      if (weAreOnTaskPage) {
        if (isDefined(activityToCreate.completedAt)) {
          injectActivitiesQueries({
            activitiesFilters: currentCompletedTaskQueryVariables?.filter,
            activitiesOrderByVariables:
              currentCompletedTaskQueryVariables?.orderBy,
            activityTargetsToInject: activityToCreate.activityTargets,
            activityToInject: activityToCreate,
            targetableObjects: [],
          });
        } else {
          injectActivitiesQueries({
            activitiesFilters: currentIncompleteTaskQueryVariables?.filter,
            activitiesOrderByVariables:
              currentIncompleteTaskQueryVariables?.orderBy,
            activityTargetsToInject: activityToCreate.activityTargets,
            activityToInject: activityToCreate,
            targetableObjects: [],
          });
        }

        injectIntoActivityTargetsQueries({
          activityTargetsToInject: activityToCreate.activityTargets,
          targetableObjects: [],
        });
      }

      // Call optimistic effects
      if (weAreOnObjectShowPage && isDefined(objectShowPageTargetableObject)) {
        // TODO: see here
        injectIntoTimelineActivitiesQueries({
          timelineTargetableObject: objectShowPageTargetableObject,
          activityToInject: activityToCreate,
          activityTargetsToInject: activityToCreate.activityTargets,
        });

        const injectOnlyInIdFilterForTaskQueries =
          activityToCreate.type !== 'Task';

        const injectOnlyInIdFilterForNotesQueries =
          activityToCreate.type !== 'Note';

        if (isDefined(currentCompletedTaskQueryVariables)) {
          injectActivitiesQueries({
            activitiesFilters: currentCompletedTaskQueryVariables?.filter,
            activitiesOrderByVariables:
              currentCompletedTaskQueryVariables?.orderBy,
            activityTargetsToInject: activityToCreate.activityTargets,
            activityToInject: activityToCreate,
            targetableObjects: [objectShowPageTargetableObject],
            injectOnlyInIdFilter: injectOnlyInIdFilterForTaskQueries,
          });
        }

        if (isDefined(currentIncompleteTaskQueryVariables)) {
          injectActivitiesQueries({
            activitiesFilters:
              currentIncompleteTaskQueryVariables?.filter ?? {},
            activitiesOrderByVariables:
              currentIncompleteTaskQueryVariables?.orderBy ?? {},
            activityTargetsToInject: activityToCreate.activityTargets,
            activityToInject: activityToCreate,
            targetableObjects: [objectShowPageTargetableObject],
            injectOnlyInIdFilter: injectOnlyInIdFilterForTaskQueries,
          });
        }

        if (isDefined(currentNotesQueryVariables)) {
          injectActivitiesQueries({
            activitiesFilters: currentNotesQueryVariables?.filter,
            activitiesOrderByVariables: currentNotesQueryVariables?.orderBy,
            activityTargetsToInject: activityToCreate.activityTargets,
            activityToInject: activityToCreate,
            targetableObjects: [objectShowPageTargetableObject],
            injectOnlyInIdFilter: injectOnlyInIdFilterForNotesQueries,
          });
        }

        injectIntoActivityTargetsQueries({
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
