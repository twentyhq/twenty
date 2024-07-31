import { useApolloClient } from '@apollo/client';

import { findActivitiesOperationSignatureFactory } from '@/activities/graphql/operation-signatures/factories/findActivitiesOperationSignatureFactory';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { Note } from '@/activities/types/Note';
import { NoteTarget } from '@/activities/types/NoteTarget';
import { Task } from '@/activities/types/Task';
import { TaskTarget } from '@/activities/types/TaskTarget';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { sortByAscString } from '~/utils/array/sortByAscString';
import { isDefined } from '~/utils/isDefined';

export const usePrepareFindManyActivitiesQuery = ({
  activityObjectNameSingular,
}: {
  activityObjectNameSingular: CoreObjectNameSingular;
}) => {
  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItem({
      objectNameSingular: activityObjectNameSingular,
    });

  const getActivityFromCache = useGetRecordFromCache({
    objectNameSingular: activityObjectNameSingular,
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
    shouldActivityBeExcluded?: (activityTarget: Task | Note) => boolean;
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

    const activityTargets: (TaskTarget | NoteTarget)[] =
      targetableObjectRecord?.taskTargets ??
      targetableObjectRecord?.noteTargets ??
      [];

    const activityTargetIds = [
      ...new Set(
        activityTargets
          .map((activityTarget) => activityTarget.id)
          .filter(isDefined),
      ),
    ];

    const activities: (Task | Note)[] = activityTargetIds
      .map((activityTargetId) => {
        const activityTarget = activityTargets.find(
          (activityTarget) => activityTarget.id === activityTargetId,
        );

        if (!activityTarget) {
          return undefined;
        }

        return getActivityFromCache<Task | Note>(activityTarget.activityId);
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
      ...activities.filter((activity) => !shouldActivityBeExcluded?.(activity)),
    ].sort((a, b) => {
      return a.createdAt > b.createdAt ? -1 : 1;
    });

    const FIND_ACTIVITIES_OPERATION_SIGNATURE =
      findActivitiesOperationSignatureFactory({
        objectNameSingular: activityObjectNameSingular,
        objectMetadataItems,
      });

    upsertFindManyActivitiesInCache({
      objectRecordsToOverwrite: filteredActivities,
      queryVariables: {
        ...nextFindManyActivitiesQueryFilter,
        orderBy: [{ createdAt: 'DescNullsFirst' }],
      },
      recordGqlFields: FIND_ACTIVITIES_OPERATION_SIGNATURE.fields,
      computeReferences: true,
    });
  };

  return {
    prepareFindManyActivitiesQuery,
  };
};
