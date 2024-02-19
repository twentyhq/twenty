import { useInjectIntoActivitiesQuery } from '@/activities/hooks/useInjectIntoActivitiesQuery';
import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useReadFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useReadFindManyRecordsQueryInCache';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';

export const useInjectIntoTimelineActivitiesQueries = () => {
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

  const { injectActivitiesQueries } = useInjectIntoActivitiesQuery();

  const injectIntoTimelineActivitiesQueries = ({
    activityToInject,
    activityTargetsToInject,
    timelineTargetableObject,
  }: {
    activityToInject: Activity;
    activityTargetsToInject: ActivityTarget[];
    timelineTargetableObject: ActivityTargetableObject;
  }) => {
    injectActivitiesQueries({
      activitiesFilters: {},
      activitiesOrderByVariables: {
        createdAt: 'DescNullsFirst',
      },
      activityTargetsToInject,
      activityToInject,
      targetableObjects: [timelineTargetableObject],
    });

    // const newActivity = {
    //   ...activityToInject,
    //   __typename: 'Activity',
    // };

    // const targetObjectFieldName = getActivityTargetObjectFieldIdName({
    //   nameSingular: timelineTargetableObject.targetObjectNameSingular,
    // });

    // const activitiyTargetsForTargetableObjectQueryVariables = {
    //   filter: {
    //     [targetObjectFieldName]: {
    //       eq: timelineTargetableObject.id,
    //     },
    //   },
    // };

    // const existingActivityTargetsForTargetableObject =
    //   readFindManyActivityTargetsQueryInCache({
    //     queryVariables: activitiyTargetsForTargetableObjectQueryVariables,
    //   });

    // const newActivityTargetsForTargetableObject = [
    //   ...existingActivityTargetsForTargetableObject,
    //   ...activityTargetsToInject,
    // ];

    // const existingActivityIds = existingActivityTargetsForTargetableObject
    //   ?.map((activityTarget) => activityTarget.activityId)
    //   .filter(isNonEmptyString);

    // const timelineActivitiesQueryVariablesBeforeDrawerMount =
    //   makeTimelineActivitiesQueryVariables({
    //     activityIds: existingActivityIds,
    //   });

    // console.log({
    //   timelineActivitiesQueryVariablesBeforeDrawerMount,
    // });

    // const existingActivities = readFindManyActivitiesQueryInCache({
    //   queryVariables: timelineActivitiesQueryVariablesBeforeDrawerMount,
    // });

    // const activityIdsAfterDrawerMount = [
    //   ...existingActivityIds,
    //   newActivity.id,
    // ];

    // const timelineActivitiesQueryVariablesAfterDrawerMount =
    //   makeTimelineActivitiesQueryVariables({
    //     activityIds: activityIdsAfterDrawerMount,
    //   });

    // overwriteFindManyActivityTargetsQueryInCache({
    //   objectRecordsToOverwrite: newActivityTargetsForTargetableObject,
    //   queryVariables: activitiyTargetsForTargetableObjectQueryVariables,
    // });

    // const newActivities = [newActivity, ...existingActivities].toSorted(
    //   sortObjectRecordByDateField('createdAt', 'DescNullsFirst'),
    // );

    // console.log({
    //   existingActivities,
    //   newActivities,
    // });

    // overwriteFindManyActivitiesInCache({
    //   objectRecordsToOverwrite: newActivities,
    //   queryVariables: timelineActivitiesQueryVariablesAfterDrawerMount,
    // });
  };

  return {
    injectIntoTimelineActivitiesQueries,
  };
};
