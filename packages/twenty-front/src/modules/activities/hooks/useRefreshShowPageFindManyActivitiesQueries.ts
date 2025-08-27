import { useRecoilValue } from 'recoil';

import { usePrepareFindManyActivitiesQuery } from '@/activities/hooks/usePrepareFindManyActivitiesQuery';
import { objectShowPageTargetableObjectState } from '@/activities/timeline-activities/states/objectShowPageTargetableObjectIdState';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isDefined } from 'twenty-shared/utils';

// This hook should only be executed if the normalized cache is up-to-date
// It will take a targetableObject and prepare the queries for the activities
// based on the activityTargets of the targetableObject
export const useRefreshShowPageFindManyActivitiesQueries = ({
  activityObjectNameSingular,
}: {
  activityObjectNameSingular: CoreObjectNameSingular;
}) => {
  const objectShowPageTargetableObject = useRecoilValue(
    objectShowPageTargetableObjectState,
  );

  const { prepareFindManyActivitiesQuery } = usePrepareFindManyActivitiesQuery({
    activityObjectNameSingular,
  });

  const refreshShowPageFindManyActivitiesQueries = () => {
    if (isDefined(objectShowPageTargetableObject)) {
      prepareFindManyActivitiesQuery({
        targetableObject: objectShowPageTargetableObject,
      });
      prepareFindManyActivitiesQuery({
        targetableObject: objectShowPageTargetableObject,
        additionalFilter: {
          status: { eq: 'TODO' },
        },
      });
      prepareFindManyActivitiesQuery({
        targetableObject: objectShowPageTargetableObject,
        additionalFilter: {},
      });
    }
  };

  return {
    refreshShowPageFindManyActivitiesQueries,
  };
};
