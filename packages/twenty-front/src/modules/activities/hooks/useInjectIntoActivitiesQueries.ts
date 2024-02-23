import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';

import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { OrderByField } from '@/object-metadata/types/OrderByField';
import { useReadFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useReadFindManyRecordsQueryInCache';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { ObjectRecordQueryFilter } from '@/object-record/record-filter/types/ObjectRecordQueryFilter';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { sortByAscString } from '~/utils/array/sortByAscString';

// TODO: create a generic hook from this
export const useInjectIntoActivitiesQueries = () => {
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

  const injectActivitiesQueries = ({
    activityToInject,
    activityTargetsToInject,
    targetableObjects,
    activitiesFilters,
    activitiesOrderByVariables,
    injectOnlyInIdFilter,
  }: {
    activityToInject: Activity;
    activityTargetsToInject: ActivityTarget[];
    targetableObjects: ActivityTargetableObject[];
    activitiesFilters?: ObjectRecordQueryFilter;
    activitiesOrderByVariables?: OrderByField;
    injectOnlyInIdFilter?: boolean;
  }) => {
    const hasActivityTargets = isNonEmptyArray(targetableObjects);

    if (hasActivityTargets) {
      const findManyActivitiyTargetsQueryFilter = getActivityTargetsFilter({
        targetableObjects,
      });

      const findManyActivitiyTargetsQueryVariables = {
        filter: findManyActivitiyTargetsQueryFilter,
      };

      const existingActivityTargetsWithMaybeDuplicates =
        readFindManyActivityTargetsQueryInCache({
          queryVariables: findManyActivitiyTargetsQueryVariables,
        });

      const existingActivityTargetsWithoutDuplicates: ObjectRecord[] =
        existingActivityTargetsWithMaybeDuplicates.filter(
          (existingActivityTarget) =>
            !activityTargetsToInject.some(
              (activityTargetToInject) =>
                activityTargetToInject.id === existingActivityTarget.id,
            ),
        );

      const existingActivityIdsFromTargets =
        existingActivityTargetsWithoutDuplicates
          ?.map((activityTarget) => activityTarget.activityId)
          .filter(isNonEmptyString);

      const currentFindManyActivitiesQueryVariables = {
        filter: {
          id: {
            in: existingActivityIdsFromTargets.toSorted(sortByAscString),
          },
          ...activitiesFilters,
        },
        orderBy: activitiesOrderByVariables,
      };

      const existingActivities = readFindManyActivitiesQueryInCache({
        queryVariables: currentFindManyActivitiesQueryVariables,
      });

      const nextActivityIds = [
        ...existingActivityIdsFromTargets,
        activityToInject.id,
      ];

      const nextFindManyActivitiesQueryVariables = {
        filter: {
          id: {
            in: nextActivityIds.toSorted(sortByAscString),
          },
          ...activitiesFilters,
        },
        orderBy: activitiesOrderByVariables,
      };

      const newActivities = [...existingActivities];

      if (!injectOnlyInIdFilter) {
        const newActivity = {
          ...activityToInject,
          __typename: 'Activity',
        };

        newActivities.unshift(newActivity);
      }

      overwriteFindManyActivitiesInCache({
        objectRecordsToOverwrite: newActivities,
        queryVariables: nextFindManyActivitiesQueryVariables,
      });
    } else {
      const currentFindManyActivitiesQueryVariables = {
        filter: {
          ...activitiesFilters,
        },
        orderBy: activitiesOrderByVariables,
      };

      const existingActivities = readFindManyActivitiesQueryInCache({
        queryVariables: currentFindManyActivitiesQueryVariables,
      });

      const nextFindManyActivitiesQueryVariables = {
        filter: {
          ...activitiesFilters,
        },
        orderBy: activitiesOrderByVariables,
      };

      const newActivities = [...existingActivities];

      if (!injectOnlyInIdFilter) {
        const newActivity = {
          ...activityToInject,
          __typename: 'Activity',
        };

        newActivities.unshift(newActivity);
      }

      overwriteFindManyActivitiesInCache({
        objectRecordsToOverwrite: newActivities,
        queryVariables: nextFindManyActivitiesQueryVariables,
      });
    }
  };

  return {
    injectActivitiesQueries,
  };
};
