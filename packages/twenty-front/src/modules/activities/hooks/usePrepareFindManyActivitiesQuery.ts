import { findActivitiesOperationSignatureFactory } from '@/activities/graphql/operation-signatures/factories/findActivitiesOperationSignatureFactory';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type ActivityTarget } from '@/activities/types/ActivityTarget';
import { type Note } from '@/activities/types/Note';
import { type Task } from '@/activities/types/Task';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getRelatedRecordIdFromJunction } from '@/object-record/record-field/ui/utils/junction/getRelatedRecordIdFromJunction';
import { getActivityTargetJunctionConfig } from '@/activities/utils/getActivityTargetJunctionConfig';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getRecordArrayField } from '@/object-record/utils/getRecordArrayField';
import { isDefined } from 'twenty-shared/utils';
import { sortByAscString } from '~/utils/array/sortByAscString';

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

  const cache = useApolloCoreClient().cache;
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

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

    if (!isDefined(targetableObjectMetadataItem)) {
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

    const junctionConfig = getActivityTargetJunctionConfig({
      activityObjectMetadata: objectMetadataItemActivity,
      objectMetadataItems,
    });

    if (!isDefined(junctionConfig?.sourceField)) {
      return;
    }

    const activityRelationFieldName = junctionConfig.sourceField.name;
    const activityTargetObjectMetadataId =
      junctionConfig.junctionObjectMetadata.id;

    const activityTargetFieldName = targetableObjectMetadataItem.fields.find(
      (field) =>
        field.relation?.targetObjectMetadata.id ===
        activityTargetObjectMetadataId,
    )?.name;

    if (!isDefined(activityTargetFieldName)) {
      return;
    }

    const activityTargets = getRecordArrayField<ActivityTarget>(
      targetableObjectRecord,
      activityTargetFieldName,
    );

    const activityIds = [
      ...new Set(
        activityTargets
          .map((activityTarget) =>
            getRelatedRecordIdFromJunction({
              junctionRecord: activityTarget,
              relationFieldName: activityRelationFieldName,
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
