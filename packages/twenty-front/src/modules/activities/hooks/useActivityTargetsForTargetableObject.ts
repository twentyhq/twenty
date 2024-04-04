import { useState } from 'react';
import { isNonEmptyString } from '@sniptt/guards';

import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getActivityTargetObjectFieldIdName';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export const useActivityTargetsForTargetableObject = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const targetObjectFieldName = getActivityTargetObjectFieldIdName({
    nameSingular: targetableObject.targetObjectNameSingular,
  });

  const [initialized, setInitialized] = useState(false);

  const targetableObjectId = targetableObject.id;

  const skipRequest = !isNonEmptyString(targetableObjectId);

  // TODO: We want to optimistically remove from this request
  //   If we are on a show page and we remove the current show page object corresponding activity target
  //   See also if we need to update useTimelineActivities
  const { records: activityTargets, loading: loadingActivityTargets } =
    useFindManyRecords<ActivityTarget>({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
      skip: skipRequest,
      filter: {
        [targetObjectFieldName]: {
          eq: targetableObject.id,
        },
      },
      onCompleted: () => {
        if (!initialized) {
          setInitialized(true);
        }
      },
    });

  return {
    activityTargets,
    loadingActivityTargets,
    initialized,
  };
};
