import { useRecoilValue } from 'recoil';

import { useRemoveFromActivitiesQueries } from '@/activities/hooks/useRemoveFromActivitiesQueries';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timeline/constants/FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY';
import { timelineTargetableObjectState } from '@/activities/timeline/states/timelineTargetableObjectState';
import { ActivityTarget } from '@/activities/types/ActivityTarget';

export const useRemoveFromTimelineActivitiesQueries = () => {
  const timelineTargetableObject = useRecoilValue(
    timelineTargetableObjectState,
  );

  // const { objectMetadataItem: objectMetadataItemActivity } =
  //   useObjectMetadataItemOnly({
  //     objectNameSingular: CoreObjectNameSingular.Activity,
  //   });

  // const {
  //   upsertFindManyRecordsQueryInCache: overwriteFindManyActivitiesInCache,
  // } = useUpsertFindManyRecordsQueryInCache({
  //   objectMetadataItem: objectMetadataItemActivity,
  // });

  // const { objectMetadataItem: objectMetadataItemActivityTarget } =
  //   useObjectMetadataItemOnly({
  //     objectNameSingular: CoreObjectNameSingular.ActivityTarget,
  //   });

  // const {
  //   readFindManyRecordsQueryInCache: readFindManyActivityTargetsQueryInCache,
  // } = useReadFindManyRecordsQueryInCache({
  //   objectMetadataItem: objectMetadataItemActivityTarget,
  // });

  // const {
  //   readFindManyRecordsQueryInCache: readFindManyActivitiesQueryInCache,
  // } = useReadFindManyRecordsQueryInCache({
  //   objectMetadataItem: objectMetadataItemActivity,
  // });

  // const {
  //   upsertFindManyRecordsQueryInCache:
  //     overwriteFindManyActivityTargetsQueryInCache,
  // } = useUpsertFindManyRecordsQueryInCache({
  //   objectMetadataItem: objectMetadataItemActivityTarget,
  // });

  const { removeFromActivitiesQueries } = useRemoveFromActivitiesQueries();

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

    removeFromActivitiesQueries({
      activityIdToRemove,
      activityTargetsToRemove,
      targetableObjects: [timelineTargetableObject],
      activitiesFilters: {},
      activitiesOrderByVariables: FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
    });

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

    // const newActivityTargetsForTargetableObject = isNonEmptyArray(
    //   activityTargetsToRemove,
    // )
    //   ? existingActivityTargetsForTargetableObject.filter(
    //       (existingActivityTarget) =>
    //         activityTargetsToRemove.some(
    //           (activityTargetToRemove) =>
    //             activityTargetToRemove.id !== existingActivityTarget.id,
    //         ),
    //     )
    //   : existingActivityTargetsForTargetableObject;

    // overwriteFindManyActivityTargetsQueryInCache({
    //   objectRecordsToOverwrite: newActivityTargetsForTargetableObject,
    //   queryVariables: activitiyTargetsForTargetableObjectQueryVariables,
    // });

    // const existingActivityIds = existingActivityTargetsForTargetableObject
    //   ?.map((activityTarget) => activityTarget.activityId)
    //   .filter(isNonEmptyString);

    // const timelineActivitiesQueryVariablesBeforeDrawerMount =
    //   makeTimelineActivitiesQueryVariables({
    //     activityIds: existingActivityIds,
    //   });

    // const existingActivities = readFindManyActivitiesQueryInCache({
    //   queryVariables: timelineActivitiesQueryVariablesBeforeDrawerMount,
    // });

    // const activityIdsAfterRemoval = existingActivityIds.filter(
    //   (existingActivityId) => existingActivityId !== activityIdToRemove,
    // );

    // const timelineActivitiesQueryVariablesAfterRemoval =
    //   makeTimelineActivitiesQueryVariables({
    //     activityIds: activityIdsAfterRemoval,
    //   });

    // const newActivities = existingActivities
    //   .filter((existingActivity) => existingActivity.id !== activityIdToRemove)
    //   .toSorted(sortObjectRecordByDateField('createdAt', 'DescNullsFirst'));

    // overwriteFindManyActivitiesInCache({
    //   objectRecordsToOverwrite: newActivities,
    //   queryVariables: timelineActivitiesQueryVariablesAfterRemoval,
    // });
  };

  return {
    removeFromTimelineActivitiesQueries,
  };
};
