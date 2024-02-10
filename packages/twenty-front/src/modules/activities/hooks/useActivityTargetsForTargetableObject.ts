import { useState } from 'react';
import { isNonEmptyString } from '@sniptt/guards';

import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getTargetObjectFilterFieldName';
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

  const { records: activityTargets, loading: loadingActivityTargets } =
    useFindManyRecords({
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
    activityTargets: activityTargets as ActivityTarget[],
    loadingActivityTargets,
    initialized,
  };
};
