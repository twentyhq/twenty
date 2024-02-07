import { useState } from 'react';

import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getTargetObjectFilterFieldName';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

export const useActivityTargets = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const targetObjectFieldName = getActivityTargetObjectFieldIdName({
    nameSingular: targetableObject.targetObjectNameSingular,
  });

  const [initialized, setInitialized] = useState(false);

  const { records: activityTargets, loading: loadingActivityTargets } =
    useFindManyRecords({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
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
