import { useRecoilValue } from 'recoil';

import { usePrepareFindManyActivitiesQuery } from '@/activities/hooks/usePrepareFindManyActivitiesQuery';
import { objectShowPageTargetableObjectState } from '@/activities/timeline/states/objectShowPageTargetableObjectIdState';
import { Activity } from '@/activities/types/Activity';
import { isDefined } from '~/utils/isDefined';

// This hook should only be executed if the normalized cache is up-to-date
// It will take a targetableObject and prepare the queries for the activities
// based on the activityTargets of the targetableObject
export const useRefreshShowPageFindManyActivitiesQueries = () => {
  const objectShowPageTargetableObject = useRecoilValue(
    objectShowPageTargetableObjectState,
  );

  const { prepareFindManyActivitiesQuery } =
    usePrepareFindManyActivitiesQuery();

  const refreshShowPageFindManyActivitiesQueries = () => {
    if (isDefined(objectShowPageTargetableObject)) {
      prepareFindManyActivitiesQuery({
        targetableObject: objectShowPageTargetableObject,
      });
      prepareFindManyActivitiesQuery({
        targetableObject: objectShowPageTargetableObject,
        additionalFilter: {
          completedAt: { is: 'NULL' },
          type: { eq: 'Task' },
        },
        shouldActivityBeExcluded: (activity: Activity) => {
          return activity.type !== 'Task';
        },
      });
      prepareFindManyActivitiesQuery({
        targetableObject: objectShowPageTargetableObject,
        additionalFilter: {
          type: { eq: 'Note' },
        },
        shouldActivityBeExcluded: (activity: Activity) => {
          return activity.type !== 'Note';
        },
      });
    }
  };

  return {
    refreshShowPageFindManyActivitiesQueries,
  };
};
