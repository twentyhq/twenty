import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';

import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { OrderByField } from '@/object-metadata/types/OrderByField';
import { useReadFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useReadFindManyRecordsQueryInCache';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { ObjectRecordQueryFilter } from '@/object-record/record-filter/types/ObjectRecordQueryFilter';
import { sortByAscString } from '~/utils/array/sortByAscString';

export const useRemoveFromActivitiesQueries = () => {
  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.Activity,
    });

  const {
    upsertFindManyRecordsQueryInCache: overwriteFindManyActivitiesInCache,
  } = useUpsertFindManyRecordsQueryInCache({
    objectMetadataItem: objectMetadataItemActivity,
  });

  const { objectMetadataItem: objectMetadataItemActivityTarget } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const {
    readFindManyRecordsQueryInCache: readFindManyActivityTargetsQueryInCache,
  } = useReadFindManyRecordsQueryInCache({
    objectMetadataItem: objectMetadataItemActivityTarget,
  });

  const {
    readFindManyRecordsQueryInCache: readFindManyActivitiesQueryInCache,
  } = useReadFindManyRecordsQueryInCache({
    objectMetadataItem: objectMetadataItemActivity,
  });

  const {
    upsertFindManyRecordsQueryInCache:
      overwriteFindManyActivityTargetsQueryInCache,
  } = useUpsertFindManyRecordsQueryInCache({
    objectMetadataItem: objectMetadataItemActivityTarget,
  });

  const removeFromActivitiesQueries = ({
    activityIdToRemove,
    activityTargetsToRemove,
    targetableObjects,
    activitiesFilters,
    activitiesOrderByVariables,
  }: {
    activityIdToRemove: string;
    activityTargetsToRemove: ActivityTarget[];
    targetableObjects: ActivityTargetableObject[];
    activitiesFilters?: ObjectRecordQueryFilter;
    activitiesOrderByVariables?: OrderByField;
  }) => {
    const findManyActivitiyTargetsQueryFilter = getActivityTargetsFilter({
      targetableObjects,
    });

    const existingActivityTargetsForTargetableObject =
      readFindManyActivityTargetsQueryInCache({
        queryVariables: findManyActivitiyTargetsQueryFilter,
      });

    const newActivityTargetsForTargetableObject = isNonEmptyArray(
      activityTargetsToRemove,
    )
      ? existingActivityTargetsForTargetableObject.filter(
          (existingActivityTarget) =>
            activityTargetsToRemove.some(
              (activityTargetToRemove) =>
                activityTargetToRemove.id !== existingActivityTarget.id,
            ),
        )
      : existingActivityTargetsForTargetableObject;

    overwriteFindManyActivityTargetsQueryInCache({
      objectRecordsToOverwrite: newActivityTargetsForTargetableObject,
      queryVariables: findManyActivitiyTargetsQueryFilter,
    });

    const existingActivityIds = existingActivityTargetsForTargetableObject
      ?.map((activityTarget) => activityTarget.activityId)
      .filter(isNonEmptyString);

    const currentFindManyActivitiesQueryVariables = {
      filter: {
        id: {
          in: existingActivityIds.toSorted(sortByAscString),
        },
        ...activitiesFilters,
      },
      orderBy: activitiesOrderByVariables,
    };

    const existingActivities = readFindManyActivitiesQueryInCache({
      queryVariables: currentFindManyActivitiesQueryVariables,
    });

    const activityIdsAfterRemoval = existingActivityIds.filter(
      (existingActivityId) => existingActivityId !== activityIdToRemove,
    );

    const nextFindManyActivitiesQueryVariables = {
      filter: {
        id: {
          in: activityIdsAfterRemoval.toSorted(sortByAscString),
        },
        ...activitiesFilters,
      },
      orderBy: activitiesOrderByVariables,
    };

    const newActivities = existingActivities.filter(
      (existingActivity) => existingActivity.id !== activityIdToRemove,
    );

    overwriteFindManyActivitiesInCache({
      objectRecordsToOverwrite: newActivities,
      queryVariables: nextFindManyActivitiesQueryVariables,
    });
  };

  return {
    removeFromActivitiesQueries,
  };
};
