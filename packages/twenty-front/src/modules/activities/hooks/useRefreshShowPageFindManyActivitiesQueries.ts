import { usePrepareFindManyActivitiesQuery } from '@/activities/hooks/usePrepareFindManyActivitiesQuery';
import { objectShowPageTargetableObjectStateV2 } from '@/activities/timeline-activities/states/objectShowPageTargetableObjectStateV2';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { isDefined } from 'twenty-shared/utils';

// This hook should only be executed if the normalized cache is up-to-date
// It will take a targetableObject and prepare the queries for the activities
// based on the activityTargets of the targetableObject
export const useRefreshShowPageFindManyActivitiesQueries = ({
  activityObjectNameSingular,
}: {
  activityObjectNameSingular: CoreObjectNameSingular;
}) => {
  const objectShowPageTargetableObject = useRecoilValueV2(
    objectShowPageTargetableObjectStateV2,
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
