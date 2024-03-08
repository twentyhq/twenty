import { isNonEmptyArray } from '@sniptt/guards';

import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useReadFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useReadFindManyRecordsQueryInCache';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

export const useRemoveFromActivityTargetsQueries = () => {
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
    upsertFindManyRecordsQueryInCache:
      overwriteFindManyActivityTargetsQueryInCache,
  } = useUpsertFindManyRecordsQueryInCache({
    objectMetadataItem: objectMetadataItemActivityTarget,
  });

  const removeFromActivityTargetsQueries = ({
    activityTargetsToRemove,
    targetableObjects,
  }: {
    activityTargetsToRemove: ActivityTarget[];
    targetableObjects: ActivityTargetableObject[];
  }) => {
    const findManyActivitiyTargetsQueryFilter = getActivityTargetsFilter({
      targetableObjects,
    });

    const findManyActivityTargetsQueryVariables = {
      filter: findManyActivitiyTargetsQueryFilter,
    } as ObjectRecordQueryVariables;

    const existingActivityTargetsForTargetableObject =
      readFindManyActivityTargetsQueryInCache({
        queryVariables: findManyActivityTargetsQueryVariables,
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
      queryVariables: findManyActivityTargetsQueryVariables,
      depth: 2,
    });
  };

  return {
    removeFromActivityTargetsQueries,
  };
};
