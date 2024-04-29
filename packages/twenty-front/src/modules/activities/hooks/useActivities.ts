import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';

import { findActivitiesOperationSignatureFactory } from '@/activities/graphql-operations/factories/findActivitiesOperationSignatureFactory';
import { useActivityTargetsForTargetableObjects } from '@/activities/hooks/useActivityTargetsForTargetableObjects';
import { Activity } from '@/activities/types/Activity';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordGqlOperationFilter } from '@/object-record/graphql-operations/types/RecordGqlOperationFilter';
import { RecordGqlOperationOrderBy } from '@/object-record/graphql-operations/types/RecordGqlOperationOrderBy';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { sortByAscString } from '~/utils/array/sortByAscString';

export const useActivities = ({
  targetableObjects,
  activitiesFilters,
  activitiesOrderByVariables,
  skip,
}: {
  targetableObjects: ActivityTargetableObject[];
  activitiesFilters: RecordGqlOperationFilter;
  activitiesOrderByVariables: RecordGqlOperationOrderBy;
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

  const filter: RecordGqlOperationFilter = {
    id:
      targetableObjects.length > 0
        ? {
            in: activityIds,
          }
        : undefined,
    ...activitiesFilters,
  };

  const FIND_ACTIVITIES_OPERATION_SIGNATURE =
    findActivitiesOperationSignatureFactory({ objectMetadataItems });

  const { records: activities, loading: loadingActivities } =
    useFindManyRecords<Activity>({
      skip: skip,
      objectNameSingular:
        FIND_ACTIVITIES_OPERATION_SIGNATURE.objectNameSingular,
      recordGqlFields: FIND_ACTIVITIES_OPERATION_SIGNATURE.fields,
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
