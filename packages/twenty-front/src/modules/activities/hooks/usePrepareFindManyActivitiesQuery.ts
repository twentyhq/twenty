import { useApolloClient } from '@apollo/client';

import { FIND_MANY_ACTIVITIES_QUERY_KEY } from '@/activities/query-keys/FindManyActivitiesQueryKey';
import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { sortByAscString } from '~/utils/array/sortByAscString';
import { isDefined } from '~/utils/isDefined';

export const usePrepareFindManyActivitiesQuery = () => {
  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.Activity,
    });

  const getActivityFromCache = useGetRecordFromCache({
    objectMetadataItem: objectMetadataItemActivity,
  });

  const cache = useApolloClient().cache;
  const { objectMetadataItems } = useObjectMetadataItems();

  const { upsertFindManyRecordsQueryInCache: upsertFindManyActivitiesInCache } =
    useUpsertFindManyRecordsQueryInCache({
      objectMetadataItem: objectMetadataItemActivity,
    });

  const prepareFindManyActivitiesQuery = ({
    targetableObject,
    additionalFilter,
    shouldActivityBeExcluded,
  }: {
    additionalFilter?: Record<string, unknown>;
    targetableObject: ActivityTargetableObject;
    shouldActivityBeExcluded?: (activityTarget: Activity) => boolean;
  }) => {
    const targetableObjectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.nameSingular ===
        targetableObject.targetObjectNameSingular,
    );

    if (!targetableObjectMetadataItem) {
      throw new Error(
        `Cannot find object metadata item for targetable object ${targetableObject.targetObjectNameSingular}`,
      );
    }

    const targetableObjectRecord = getRecordFromCache<ObjectRecord>({
      recordId: targetableObject.id,
      objectMetadataItem: targetableObjectMetadataItem,
      objectMetadataItems,
      cache,
    });

    const activityTargets: ActivityTarget[] =
      targetableObjectRecord?.activityTargets ?? [];

    const activityTargetIds = [
      ...new Set(
        activityTargets
          .map((activityTarget) => activityTarget.id)
          .filter(isDefined),
      ),
    ];

    const activities: Activity[] = activityTargetIds
      .map((activityTargetId) => {
        const activityTarget = activityTargets.find(
          (activityTarget) => activityTarget.id === activityTargetId,
        );

        if (!activityTarget) {
          return undefined;
        }

        return getActivityFromCache<Activity>(activityTarget.activityId);
      })
      .filter(isDefined);

    const activityIds = [...new Set(activities.map((activity) => activity.id))];

    const nextFindManyActivitiesQueryFilter = {
      filter: {
        id: {
          in: [...activityIds].sort(sortByAscString),
        },
        ...additionalFilter,
      },
    };

    const filteredActivities = [
      ...activities.filter(
        (activity) => !shouldActivityBeExcluded?.(activity) ?? true,
      ),
    ].sort((a, b) => {
      return a.createdAt > b.createdAt ? -1 : 1;
    });

    upsertFindManyActivitiesInCache({
      objectRecordsToOverwrite: filteredActivities,
      queryVariables: {
        ...nextFindManyActivitiesQueryFilter,
        orderBy: { createdAt: 'DescNullsFirst' },
      },
      depth: FIND_MANY_ACTIVITIES_QUERY_KEY.depth,
      queryFields:
        FIND_MANY_ACTIVITIES_QUERY_KEY.fieldsFactory?.(objectMetadataItems),
      computeReferences: true,
    });
  };

  return {
    prepareFindManyActivitiesQuery,
  };
};
