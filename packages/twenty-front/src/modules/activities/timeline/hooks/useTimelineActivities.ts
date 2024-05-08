import { useEffect } from 'react';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { useActivityTargetsForTargetableObject } from '@/activities/hooks/useActivityTargetsForTargetableObject';
import { objectShowPageTargetableObjectState } from '@/activities/timeline/states/objectShowPageTargetableObjectIdState';
import { makeTimelineActivitiesQueryVariables } from '@/activities/timeline/utils/makeTimelineActivitiesQueryVariables';
import { Activity } from '@/activities/types/Activity';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { sortByAscString } from '~/utils/array/sortByAscString';
import { isDefined } from '~/utils/isDefined';

export const useTimelineActivities = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const [, setObjectShowPageTargetableObject] = useRecoilState(
    objectShowPageTargetableObjectState,
  );

  useEffect(() => {
    if (isDefined(targetableObject)) {
      setObjectShowPageTargetableObject(targetableObject);
    }
  }, [targetableObject, setObjectShowPageTargetableObject]);

  const { activityTargets, loadingActivityTargets } =
    useActivityTargetsForTargetableObject({
      targetableObject,
    });

  const activityIds = Array.from(
    new Set(
      activityTargets
        ? [
            ...activityTargets
              .map((activityTarget) => activityTarget.activityId)
              .filter(isNonEmptyString),
          ].sort(sortByAscString)
        : [],
    ),
  );

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
      onCompleted: useRecoilCallback(
        ({ set }) =>
          (activities) => {
            for (const activity of activities) {
              set(recordStoreFamilyState(activity.id), activity);
            }
          },
        [],
      ),
    });

  const loading = loadingActivities || loadingActivityTargets;

  return {
    activities,
    loading,
  };
};
