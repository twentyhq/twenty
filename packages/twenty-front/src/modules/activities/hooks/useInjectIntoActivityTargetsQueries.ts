import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { FIND_MANY_ACTIVITY_TARGETS_QUERY_KEY } from '@/activities/query-keys/FindManyActivityTargetsQueryKey';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetsFilter } from '@/activities/utils/getActivityTargetsFilter';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGenerateObjectRecordOptimisticResponse } from '@/object-record/cache/hooks/useGenerateObjectRecordOptimisticResponse';
import { useReadFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useReadFindManyRecordsQueryInCache';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

// TODO: create a generic hook from this
export const useInjectIntoActivityTargetsQueries = () => {
  const { objectMetadataItem: objectMetadataItemActivityTarget } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.ActivityTarget,
    });

  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.Activity,
    });

  const {
    generateObjectRecordOptimisticResponse:
      generateActivityRecordOptimisticResponse,
  } = useGenerateObjectRecordOptimisticResponse({
    objectMetadataItem: objectMetadataItemActivity,
  });
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

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
        queryFields:
          FIND_MANY_ACTIVITY_TARGETS_QUERY_KEY.fieldsFactory?.(
            objectMetadataItems,
          ),
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
      activityId: activityTarget.activityId,
      activity: {
        ...generateActivityRecordOptimisticResponse({
          type: activityTarget.activity?.type,
          title: activityTarget.activity?.title,
        }),
        __typename: 'Activity',
        id: activityTarget.activityId,
      },
    }));

    overwriteFindManyActivityTargetsQueryInCache({
      objectRecordsToOverwrite: newActivityTargets,
      queryVariables: findManyActivitiyTargetsQueryVariables,
      queryFields: FIND_MANY_ACTIVITY_TARGETS_QUERY_KEY.fields,
      computeReferences: true,
    });
  };

  return {
    injectIntoActivityTargetsQueries,
  };
};
