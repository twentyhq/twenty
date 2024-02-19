import { useEffect, useState } from 'react';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';

import { useActivityTargetsForTargetableObjects } from '@/activities/hooks/useActivityTargetsForTargetableObjects';
import { Activity } from '@/activities/types/Activity';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useActivityConnectionUtils } from '@/activities/utils/useActivityConnectionUtils';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { OrderByField } from '@/object-metadata/types/OrderByField';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ObjectRecordQueryFilter } from '@/object-record/record-filter/types/ObjectRecordQueryFilter';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { sortByAscString } from '~/utils/array/sortByAscString';

export const useActivities = ({
  targetableObjects,
  activitiesFilters,
  activitiesOrderByVariables,
  skip,
  skipActivityTargets,
}: {
  targetableObjects: ActivityTargetableObject[];
  activitiesFilters: ObjectRecordQueryFilter;
  activitiesOrderByVariables: OrderByField;
  skip?: boolean;
  skipActivityTargets?: boolean;
}) => {
  const [initialized, setInitialized] = useState(false);

  const { makeActivityWithoutConnection } = useActivityConnectionUtils();

  const {
    activityTargets,
    loadingActivityTargets,
    initialized: initializedActivityTargets,
  } = useActivityTargetsForTargetableObjects({
    targetableObjects,
    skip: skipActivityTargets || skip,
  });

  const activityIds = activityTargets
    ?.map((activityTarget) => activityTarget.activityId)
    .filter(isNonEmptyString)
    .toSorted(sortByAscString);

  const activityTargetsFound =
    initializedActivityTargets && isNonEmptyArray(activityTargets);

  const filter: ObjectRecordQueryFilter = {
    id: activityTargetsFound
      ? {
          in: activityIds,
        }
      : undefined,
    ...activitiesFilters,
  };

  const skipActivities =
    skip ||
    (!skipActivityTargets &&
      (!initializedActivityTargets || !activityTargetsFound));

  const { records: activitiesWithConnection, loading: loadingActivities } =
    useFindManyRecords<Activity>({
      skip: skipActivities,
      objectNameSingular: CoreObjectNameSingular.Activity,
      filter,
      orderBy: activitiesOrderByVariables,
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
    });

  const loading = loadingActivities || loadingActivityTargets;

  // TODO: fix connection in relation => automatically change to an array
  const activities = activitiesWithConnection
    ?.map(makeActivityWithoutConnection as any)
    .map(({ activity }: any) => activity);

  const noActivities =
    (!activityTargetsFound && !skipActivityTargets && initialized) ||
    (initialized && !loading && !isNonEmptyArray(activities));

  useEffect(() => {
    if (skipActivities || noActivities) {
      setInitialized(true);
    }
  }, [
    activities,
    initialized,
    loading,
    noActivities,
    skipActivities,
    skipActivityTargets,
  ]);

  return {
    activities,
    loading,
    initialized,
    noActivities,
  };
};
