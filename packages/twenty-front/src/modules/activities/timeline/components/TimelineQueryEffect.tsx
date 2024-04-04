import { useEffect } from 'react';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';

import { useActivities } from '@/activities/hooks/useActivities';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timeline/constants/FindManyTimelineActivitiesOrderBy';
import { objectShowPageTargetableObjectState } from '@/activities/timeline/states/objectShowPageTargetableObjectIdState';
import { timelineActivitiesFammilyState } from '@/activities/timeline/states/timelineActivitiesFamilyState';
import { timelineActivitiesForGroupState } from '@/activities/timeline/states/timelineActivitiesForGroupState';
import { timelineActivitiesNetworkingState } from '@/activities/timeline/states/timelineActivitiesNetworkingState';
import { timelineActivityWithoutTargetsFamilyState } from '@/activities/timeline/states/timelineActivityWithoutTargetsFamilyState';
import { Activity } from '@/activities/types/Activity';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { sortObjectRecordByDateField } from '@/object-record/utils/sortObjectRecordByDateField';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from '~/utils/isDefined';

export const TimelineQueryEffect = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const setTimelineTargetableObject = useSetRecoilState(
    objectShowPageTargetableObjectState,
  );

  useEffect(() => {
    setTimelineTargetableObject(targetableObject);
  }, [targetableObject, setTimelineTargetableObject]);

  const { activities, initialized, noActivities } = useActivities({
    targetableObjects: [targetableObject],
    activitiesFilters: {},
    activitiesOrderByVariables: FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
    skip: !isDefined(targetableObject),
  });

  const [timelineActivitiesNetworking, setTimelineActivitiesNetworking] =
    useRecoilState(timelineActivitiesNetworkingState);

  const [timelineActivitiesForGroup, setTimelineActivitiesForGroup] =
    useRecoilState(timelineActivitiesForGroupState);

  useEffect(() => {
    if (!isDefined(targetableObject)) {
      return;
    }

    const activitiesForGroup = [
      ...activities.map((activity) => ({
        id: activity.id,
        createdAt: activity.createdAt,
      })),
    ].sort(sortObjectRecordByDateField('createdAt', 'DescNullsLast'));

    const timelineActivitiesForGroupSorted = [
      ...timelineActivitiesForGroup,
    ].sort(sortObjectRecordByDateField('createdAt', 'DescNullsLast'));

    if (!isDeeplyEqual(activitiesForGroup, timelineActivitiesForGroupSorted)) {
      setTimelineActivitiesForGroup(activitiesForGroup);
    }

    if (
      !isDeeplyEqual(timelineActivitiesNetworking.initialized, initialized) ||
      !isDeeplyEqual(timelineActivitiesNetworking.noActivities, noActivities)
    ) {
      setTimelineActivitiesNetworking({
        initialized,
        noActivities,
      });
    }
  }, [
    activities,
    initialized,
    noActivities,
    setTimelineActivitiesNetworking,
    targetableObject,
    timelineActivitiesNetworking,
    timelineActivitiesForGroup,
    setTimelineActivitiesForGroup,
  ]);

  const updateTimelineActivities = useRecoilCallback(
    ({ snapshot, set }) =>
      (newActivities: Activity[]) => {
        for (const newActivity of newActivities) {
          const currentActivity = snapshot
            .getLoadable(timelineActivitiesFammilyState(newActivity.id))
            .getValue();

          if (!isDeeplyEqual(newActivity, currentActivity)) {
            set(timelineActivitiesFammilyState(newActivity.id), newActivity);
          }

          const currentActivityWithoutTarget = snapshot
            .getLoadable(
              timelineActivityWithoutTargetsFamilyState(newActivity.id),
            )
            .getValue();

          const newActivityWithoutTarget = {
            id: newActivity.id,
            title: newActivity.title,
            createdAt: newActivity.createdAt,
            author: newActivity.author,
            type: newActivity.type,
          };

          if (
            !isDeeplyEqual(
              newActivityWithoutTarget,
              currentActivityWithoutTarget,
            )
          ) {
            set(
              timelineActivityWithoutTargetsFamilyState(newActivity.id),
              newActivityWithoutTarget,
            );
          }
        }
      },
    [],
  );

  useEffect(() => {
    updateTimelineActivities(activities);
  }, [activities, updateTimelineActivities]);

  return <></>;
};
