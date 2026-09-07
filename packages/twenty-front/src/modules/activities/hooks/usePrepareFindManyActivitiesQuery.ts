import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type Note } from '@/activities/types/Note';
import { type Task } from '@/activities/types/Task';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useObjectMorphJunctionConfigOrThrow } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfigOrThrow';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';
import { getJunctionRecordsFromRecord } from '@/object-record/record-field/ui/utils/junction/getJunctionRecordsFromRecord';
import { getRelatedRecordIdFromJunction } from '@/object-record/record-field/ui/utils/junction/getRelatedRecordIdFromJunction';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';
import { sortByAscString } from '~/utils/array/sortByAscString';
import { useMemo } from 'react';

export const usePrepareFindManyActivitiesQuery = ({
  activityObjectNameSingular,
}: {
  activityObjectNameSingular: CoreObjectNameSingular;
}) => {
  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItem({
      objectNameSingular: activityObjectNameSingular,
    });

  const { objectMetadataItems } = useObjectMetadataItems();

  const activityRecordGqlFields = useMemo(
    () =>
      generateDepthRecordGqlFieldsFromObject({
        objectMetadataItem: objectMetadataItemActivity,
        objectMetadataItems,
        depth: 1,
      }),
    [objectMetadataItemActivity, objectMetadataItems],
  );

  const getActivityFromCache = useGetRecordFromCache({
    objectNameSingular: activityObjectNameSingular,
    recordGqlFields: activityRecordGqlFields,
  });

  const cache = useApolloCoreClient().cache;
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const morphJunctionConfig = useObjectMorphJunctionConfigOrThrow({
    objectNameSingular: activityObjectNameSingular,
  });

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
      objectPermissionsByObjectMetadataId,
    });

    const { junctionObjectMetadata, sourceField, sourceJoinColumnName } =
      morphJunctionConfig;

    const junctionFieldName = findTargetFieldInfo(
      targetableObjectMetadataItem.fields,
      junctionObjectMetadata.id,
      objectMetadataItems,
    )?.fieldName;

    const activityTargets = isDefined(junctionFieldName)
      ? getJunctionRecordsFromRecord({
          record: targetableObjectRecord ?? {},
          junctionFieldName,
        })
      : [];

    const activityIds = [
      ...new Set(
        activityTargets
          .map((activityTarget) =>
            getRelatedRecordIdFromJunction({
              junctionRecord: activityTarget,
              relationFieldName: sourceField.name,
              joinColumnName: sourceJoinColumnName,
            }),
          )
          .filter(isDefined),
      ),
    ];

    const activities: (Task | Note)[] = activityIds
      .map((activityId) => getActivityFromCache<Task | Note>(activityId))
      .filter(isDefined);

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

    upsertFindManyActivitiesInCache({
      objectRecordsToOverwrite: filteredActivities,
      queryVariables: {
        ...nextFindManyActivitiesQueryFilter,
        orderBy: [{ createdAt: 'DescNullsFirst' }],
      },
      recordGqlFields: activityRecordGqlFields,
      computeReferences: true,
    });
  };

  return {
    prepareFindManyActivitiesQuery,
  };
};
