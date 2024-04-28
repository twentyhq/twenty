import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';

import { useActivityTargetsForTargetableObjects } from '@/activities/hooks/useActivityTargetsForTargetableObjects';
import { FIND_MANY_ACTIVITIES_QUERY_KEY } from '@/activities/query-keys/FindManyActivitiesQueryKey';
import { Activity } from '@/activities/types/Activity';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { OrderByField } from '@/object-metadata/types/OrderByField';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ObjectRecordQueryFilter } from '@/object-record/record-filter/types/ObjectRecordQueryFilter';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { sortByAscString } from '~/utils/array/sortByAscString';

export const useActivities = ({
  targetableObjects,
  activitiesFilters,
  activitiesOrderByVariables,
  skip,
}: {
  targetableObjects: ActivityTargetableObject[];
  activitiesFilters: ObjectRecordQueryFilter;
  activitiesOrderByVariables: OrderByField;
  skip?: boolean;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const { activityTargets, loadingActivityTargets } =
    useActivityTargetsForTargetableObjects({
      targetableObjects,
      skip: skip,
    });

  const activityIds = [
    ...new Set(
      activityTargets
        ? [
            ...activityTargets
              .map((activityTarget) => activityTarget.activityId)
              .filter(isNonEmptyString),
          ].sort(sortByAscString)
        : [],
    ),
  ];

  const filter: ObjectRecordQueryFilter = {
    id:
      targetableObjects.length > 0
        ? {
            in: activityIds,
          }
        : undefined,
    ...activitiesFilters,
  };

  const { records: activities, loading: loadingActivities } =
    useFindManyRecords<Activity>({
      skip: skip,
      objectNameSingular: FIND_MANY_ACTIVITIES_QUERY_KEY.objectNameSingular,
      queryFields:
        FIND_MANY_ACTIVITIES_QUERY_KEY.fieldsFactory?.(objectMetadataItems),
      filter,
      orderBy: activitiesOrderByVariables,
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

  const noActivities = !loading && !isNonEmptyArray(activities);

  return {
    activities,
    loading,
    noActivities,
  };
};
