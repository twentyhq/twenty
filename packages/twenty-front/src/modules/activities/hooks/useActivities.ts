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
}: {
  targetableObjects: ActivityTargetableObject[];
  activitiesFilters: ObjectRecordQueryFilter;
  activitiesOrderByVariables: OrderByField;
}) => {
  const [initialized, setInitialized] = useState(false);

  const { makeActivityWithoutConnection } = useActivityConnectionUtils();

  const {
    activityTargets,
    loadingActivityTargets,
    initialized: initializedActivityTargets,
  } = useActivityTargetsForTargetableObjects({
    targetableObjects,
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

  const { records: activitiesWithConnection, loading: loadingActivities } =
    useFindManyRecords<Activity>({
      // skip: !loadingActivityTargets,
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

  useEffect(() => {
    if (activityTargetsFound) {
      setInitialized(true);
    }
  }, [activityTargetsFound]);

  const loading = loadingActivities || loadingActivityTargets;

  const activities = activitiesWithConnection
    ?.map(makeActivityWithoutConnection)
    .map(({ activity }) => activity);

  return {
    activities,
    loading,
    initialized,
  };
};
