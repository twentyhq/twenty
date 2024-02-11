import { useEffect, useState } from 'react';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';

import { useActivityTargetsForTargetableObject } from '@/activities/hooks/useActivityTargetsForTargetableObject';
import { makeTimelineActivitiesQueryVariables } from '@/activities/timeline/utils/makeTimelineActivitiesQueryVariables';
import { Activity } from '@/activities/types/Activity';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export const useTimelineActivities = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const {
    activityTargets,
    loadingActivityTargets,
    initialized: initializedActivityTargets,
  } = useActivityTargetsForTargetableObject({
    targetableObject,
  });

  const [initialized, setInitialized] = useState(false);

  const activityIds = activityTargets
    ?.map((activityTarget) => activityTarget.activityId)
    .filter(isNonEmptyString);

  const timelineActivitiesQueryVariables = makeTimelineActivitiesQueryVariables(
    {
      activityIds,
    },
  );

  const { records: activities, loading: loadingActivities } =
    useFindManyRecords<Activity>({
      skip: loadingActivityTargets || !isNonEmptyArray(activityTargets),
      objectNameSingular: CoreObjectNameSingular.Activity,
      filter: timelineActivitiesQueryVariables.filter,
      orderBy: timelineActivitiesQueryVariables.orderBy,
      onCompleted: () => {
        if (!initialized) {
          setInitialized(true);
        }
      },
    });

  const noActivityTargets =
    initializedActivityTargets && !isNonEmptyArray(activityTargets);

  useEffect(() => {
    if (noActivityTargets) {
      setInitialized(true);
    }
  }, [noActivityTargets]);

  const loading = loadingActivities || loadingActivityTargets;

  return {
    activities,
    loading,
    initialized,
  };
};
