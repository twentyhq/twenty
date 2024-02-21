import { useEffect, useState } from 'react';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { useActivityTargetsForTargetableObject } from '@/activities/hooks/useActivityTargetsForTargetableObject';
import { timelineTargetableObjectState } from '@/activities/timeline/states/timelineTargetableObjectState';
import { makeTimelineActivitiesQueryVariables } from '@/activities/timeline/utils/makeTimelineActivitiesQueryVariables';
import { Activity } from '@/activities/types/Activity';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useActivityConnectionUtils } from '@/activities/utils/useActivityConnectionUtils';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { sortByAscString } from '~/utils/array/sortByAscString';
import { isDefined } from '~/utils/isDefined';

export const useTimelineActivities = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const { makeActivityWithoutConnection } = useActivityConnectionUtils();

  const [, setTimelineTargetableObject] = useRecoilState(
    timelineTargetableObjectState,
  );

  useEffect(() => {
    if (isDefined(targetableObject)) {
      setTimelineTargetableObject(targetableObject);
    }
  }, [targetableObject, setTimelineTargetableObject]);

  const {
    activityTargets,
    loadingActivityTargets,
    initialized: initializedActivityTargets,
  } = useActivityTargetsForTargetableObject({
    targetableObject,
  });

  const [initialized, setInitialized] = useState(false);

  const activityIds = Array.from(
    new Set(
      activityTargets
        ?.map((activityTarget) => activityTarget.activityId)
        .filter(isNonEmptyString)
        .toSorted(sortByAscString),
    ),
  );

  const timelineActivitiesQueryVariables = makeTimelineActivitiesQueryVariables(
    {
      activityIds,
    },
  );

  const { records: activitiesWithConnection, loading: loadingActivities } =
    useFindManyRecords<Activity>({
      skip: loadingActivityTargets || !isNonEmptyArray(activityTargets),
      objectNameSingular: CoreObjectNameSingular.Activity,
      filter: timelineActivitiesQueryVariables.filter,
      orderBy: timelineActivitiesQueryVariables.orderBy,
      onCompleted: useRecoilCallback(
        ({ set }) =>
          (data) => {
            if (!initialized) {
              setInitialized(true);
            }

            const activities = getRecordsFromRecordConnection({
              recordConnection: data,
            });

            for (const activity of activities) {
              set(recordStoreFamilyState(activity.id), activity);
            }
          },
        [initialized],
      ),
      depth: 3,
    });

  const noActivityTargets =
    initializedActivityTargets && !isNonEmptyArray(activityTargets);

  useEffect(() => {
    if (noActivityTargets) {
      setInitialized(true);
    }
  }, [noActivityTargets]);

  const loading = loadingActivities || loadingActivityTargets;

  const activities = activitiesWithConnection
    ?.map(makeActivityWithoutConnection as any)
    .map(({ activity }: any) => activity as any)
    .filter(isDefined);

  return {
    activities,
    loading,
    initialized,
  };
};
