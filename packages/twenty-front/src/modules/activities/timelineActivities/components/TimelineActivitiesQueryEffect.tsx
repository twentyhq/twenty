import { useActivities } from '@/activities/hooks/useActivities';
import { FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY } from '@/activities/timelineActivities/constants/FindManyTimelineActivitiesOrderBy';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isDefined } from '~/utils/isDefined';

export const TimelineActivitiesQueryEffect = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  useActivities({
    objectNameSingular:
      targetableObject.targetObjectNameSingular as CoreObjectNameSingular,
    targetableObjects: [targetableObject],
    activitiesFilters: {},
    activitiesOrderByVariables: FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY,
    skip: !isDefined(targetableObject),
  });

  return <></>;
};
