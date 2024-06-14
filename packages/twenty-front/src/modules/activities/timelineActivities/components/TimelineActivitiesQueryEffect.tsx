import { useActivities } from '@/activities/hooks/useActivities';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timeline/constants/FindManyTimelineActivitiesOrderBy';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { isDefined } from '~/utils/isDefined';

export const TimelineActivitiesQueryEffect = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  useActivities({
    targetableObjects: [targetableObject],
    activitiesFilters: {},
    activitiesOrderByVariables: FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
    skip: !isDefined(targetableObject),
  });

  return <></>;
};
