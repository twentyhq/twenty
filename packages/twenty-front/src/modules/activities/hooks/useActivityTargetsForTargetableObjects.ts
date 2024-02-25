import { useState } from 'react';

import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export const useActivityTargetsForTargetableObjects = ({
  targetableObjects,
  skip,
}: {
  targetableObjects: Pick<
    ActivityTargetableObject,
    'id' | 'targetObjectNameSingular'
  >[];
  skip?: boolean;
}) => {
  const activityTargetsFilter = getActivityTargetsFilter({
    targetableObjects: targetableObjects,
  });

  const [initialized, setInitialized] = useState(false);

  // TODO: We want to optimistically remove from this request
  //   If we are on a show page and we remove the current show page object corresponding activity target
  //   See also if we need to update useTimelineActivities
  const { records: activityTargets, loading: loadingActivityTargets } =
    useFindManyRecords({
      skip,
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
      filter: activityTargetsFilter,
      onCompleted: () => {
        if (!initialized) {
          setInitialized(true);
        }
      },
    });

  return {
    activityTargets: activityTargets as ActivityTarget[],
    loadingActivityTargets,
    initialized,
  };
};
