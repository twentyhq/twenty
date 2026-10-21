import { usePrepareFindManyActivitiesQuery } from '@/activities/hooks/usePrepareFindManyActivitiesQuery';
import { objectShowPageTargetableObjectState } from '@/activities/timeline-activities/states/objectShowPageTargetableObjectState';
import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

// Only run this once the normalized cache is up-to-date.
export const useRefreshShowPageFindManyActivitiesQueries = ({
  activityObjectNameSingular,
}: {
  activityObjectNameSingular: CoreObjectNameSingular;
}) => {
  const objectShowPageTargetableObject = useAtomStateValue(
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
