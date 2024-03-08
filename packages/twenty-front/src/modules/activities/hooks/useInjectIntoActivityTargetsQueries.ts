import { isNonEmptyArray } from '@sniptt/guards';

import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useReadFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useReadFindManyRecordsQueryInCache';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

// TODO: create a generic hook from this
export const useInjectIntoActivityTargetsQueries = () => {
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

  const injectActivityTargetsQueries = ({
    activityTargetsToInject,
    targetableObjects,
  }: {
    activityTargetsToInject: ActivityTarget[];
    targetableObjects: ActivityTargetableObject[];
  }) => {
    const hasActivityTargets = isNonEmptyArray(targetableObjects);

    if (!hasActivityTargets) {
      return;
    }

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

    const newActivityTargets = [
      ...existingActivityTargetsWithoutDuplicates,
      ...activityTargetsToInject,
    ];

    overwriteFindManyActivityTargetsQueryInCache({
      objectRecordsToOverwrite: newActivityTargets,
      queryVariables: findManyActivitiyTargetsQueryVariables,
      depth: 2,
    });
  };

  return {
    injectActivityTargetsQueries,
  };
};
