import { isNonEmptyArray } from '@sniptt/guards';

import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useReadFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useReadFindManyRecordsQueryInCache';
import { useUpsertFindManyRecordsQueryInCacheV2 } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCacheV2';
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
  } = useUpsertFindManyRecordsQueryInCacheV2({
    objectMetadataItem: objectMetadataItemActivityTarget,
  });

  const injectIntoActivityTargetsQueries = ({
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
    ].map((activityTarget) => ({
      ...activityTarget,
      activity: {
        __typename: 'Activity',
        id: activityTarget.activity.id,
      },
    }));

    // const sampleRecord = {
    //   ...activityTargetsToInject[0],
    //   activity: {
    //     __typename: 'Activity',
    //     id: activityTargetsToInject[0].activity.id,
    //   },
    // };

    overwriteFindManyActivityTargetsQueryInCache({
      objectRecordsToOverwrite: newActivityTargets,
      queryVariables: findManyActivitiyTargetsQueryVariables,
      queryFields: {
        __typename: true,
        id: true,
      },
    });
  };

  return {
    injectIntoActivityTargetsQueries,
  };
};
