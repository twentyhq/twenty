import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { timelineTargetableObjectState } from '@/activities/timeline/states/timelineTargetableObjectState';
import { makeTimelineActivitiesQueryVariables } from '@/activities/timeline/utils/makeTimelineActivitiesQueryVariables';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getTargetObjectFilterFieldName';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useReadFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useReadFindManyRecordsQueryInCache';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';

export const useRemoveFromTimelineActivitiesQueries = () => {
  const timelineTargetableObject = useRecoilValue(
    timelineTargetableObjectState,
  );

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

  const removeFromTimelineActivitiesQueries = ({
    activityIdToRemove,
    activityTargetsToRemove,
  }: {
    activityIdToRemove: string;
    activityTargetsToRemove: ActivityTarget[];
  }) => {
    if (!timelineTargetableObject) {
      throw new Error('Timeline targetable object is not defined');
    }

    const targetObjectFieldName = getActivityTargetObjectFieldIdName({
      nameSingular: timelineTargetableObject.targetObjectNameSingular,
    });

    const activitiyTargetsForTargetableObjectQueryVariables = {
      filter: {
        [targetObjectFieldName]: {
          eq: timelineTargetableObject.id,
        },
      },
    };

    const existingActivityTargetsForTargetableObject =
      readFindManyActivityTargetsQueryInCache({
        queryVariables: activitiyTargetsForTargetableObjectQueryVariables,
      });

    const newActivityTargetsForTargetableObject =
      existingActivityTargetsForTargetableObject.filter(
        (existingActivityTarget) =>
          activityTargetsToRemove.some(
            (activityTargetToRemove) =>
              activityTargetToRemove.id !== existingActivityTarget.id,
          ),
      );

    const existingActivityIds = existingActivityTargetsForTargetableObject
      ?.map((activityTarget) => activityTarget.activityId)
      .filter(isNonEmptyString);

    const timelineActivitiesQueryVariablesBeforeDrawerMount =
      makeTimelineActivitiesQueryVariables({
        activityIds: existingActivityIds,
      });

    const existingActivities = readFindManyActivitiesQueryInCache({
      queryVariables: timelineActivitiesQueryVariablesBeforeDrawerMount,
    });

    const activityIdsAfterRemoval = existingActivityIds.filter(
      (existingActivityId) => existingActivityId !== activityIdToRemove,
    );

    const timelineActivitiesQueryVariablesAfterRemoval =
      makeTimelineActivitiesQueryVariables({
        activityIds: activityIdsAfterRemoval,
      });

    overwriteFindManyActivityTargetsQueryInCache({
      objectRecordsToOverwrite: newActivityTargetsForTargetableObject,
      queryVariables: activitiyTargetsForTargetableObjectQueryVariables,
    });

    const newActivities = existingActivities.filter(
      (existingActivity) => existingActivity.id !== activityIdToRemove,
    );

    overwriteFindManyActivitiesInCache({
      objectRecordsToOverwrite: newActivities,
      queryVariables: timelineActivitiesQueryVariablesAfterRemoval,
    });
  };

  return {
    removeFromTimelineActivitiesQueries,
  };
};
