import { isNonEmptyString } from '@sniptt/guards';

import { makeTimelineActivitiesQueryVariables } from '@/activities/timeline/utils/makeTimelineActivitiesQueryVariables';
import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { getActivityTargetObjectFieldIdName } from '@/activities/utils/getTargetObjectFilterFieldName';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useOverwriteFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useOverwriteFindManyRecordsQueryInCache';
import { useReadFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useReadFindManyRecordsQueryInCache';

export const useInjectIntoTimelineActivitiesQueryAfterDrawerMount = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const { objectMetadataItem: objectMetadataItemActivity } =
    useObjectMetadataItemOnly({
      objectNameSingular: CoreObjectNameSingular.Activity,
    });

  const {
    overwriteFindManyRecordsQueryInCache: overwriteFindManyActivitiesInCache,
  } = useOverwriteFindManyRecordsQueryInCache({
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
    overwriteFindManyRecordsQueryInCache:
      overwriteFindManyActivityTargetsQueryInCache,
  } = useOverwriteFindManyRecordsQueryInCache({
    objectMetadataItem: objectMetadataItemActivityTarget,
  });

  const injectIntoTimelineActivitiesQueryAfterDrawerMount = ({
    activityToInject,
    activityTargetsToInject,
  }: {
    activityToInject: Activity;
    activityTargetsToInject: ActivityTarget[];
  }) => {
    const newActivity = {
      ...activityToInject,
      __typename: 'Activity',
    };

    const targetObjectFieldName = getActivityTargetObjectFieldIdName({
      nameSingular: targetableObject.targetObjectNameSingular,
    });

    const activitiyTargetsForTargetableObjectQueryVariables = {
      filter: {
        [targetObjectFieldName]: {
          eq: targetableObject.id,
        },
      },
    };

    const existingActivityTargetsForTargetableObject =
      readFindManyActivityTargetsQueryInCache({
        queryVariables: activitiyTargetsForTargetableObjectQueryVariables,
      });

    const newActivityTargetsForTargetableObject = [
      ...existingActivityTargetsForTargetableObject,
      ...activityTargetsToInject,
    ];

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

    const activityIdsAfterDrawerMount = [
      ...existingActivityIds,
      newActivity.id,
    ];

    const timelineActivitiesQueryVariablesAfterDrawerMount =
      makeTimelineActivitiesQueryVariables({
        activityIds: activityIdsAfterDrawerMount,
      });

    overwriteFindManyActivityTargetsQueryInCache({
      objectRecordsToOverwrite: newActivityTargetsForTargetableObject,
      queryVariables: activitiyTargetsForTargetableObjectQueryVariables,
    });

    const newActivities = [newActivity, ...existingActivities];

    overwriteFindManyActivitiesInCache({
      objectRecordsToOverwrite: newActivities,
      queryVariables: timelineActivitiesQueryVariablesAfterDrawerMount,
    });
  };

  return {
    injectIntoTimelineActivitiesQueryAfterDrawerMount,
  };
};
