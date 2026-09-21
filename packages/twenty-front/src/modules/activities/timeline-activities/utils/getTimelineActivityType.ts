import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { type TimelineActivityTypeMaps } from '@/activities/timeline-activities/types/TimelineActivityTypeMaps';
import { isDefined } from 'twenty-shared/utils';

export const getTimelineActivityType = (
  timelineActivity: FilterableTimelineActivity,
  timelineActivityTypeMaps: TimelineActivityTypeMaps,
): TimelineActivityType | undefined => {
  if (isDefined(timelineActivity.timelineActivityTypeSnapshot)) {
    const liveTimelineActivityType =
      timelineActivityTypeMaps.byUniversalIdentifier.get(
        timelineActivity.timelineActivityTypeSnapshot.universalIdentifier,
      );

    if (!isDefined(liveTimelineActivityType)) {
      return timelineActivity.timelineActivityTypeSnapshot;
    }

    return {
      ...timelineActivity.timelineActivityTypeSnapshot,
      id: liveTimelineActivityType.id,
      name: liveTimelineActivityType.name,
      label: liveTimelineActivityType.label,
      icon: liveTimelineActivityType.icon,
      frontComponentUniversalIdentifier:
        liveTimelineActivityType.frontComponentUniversalIdentifier,
    };
  }

  return isDefined(timelineActivity.timelineActivityTypeId)
    ? timelineActivityTypeMaps.byId.get(timelineActivity.timelineActivityTypeId)
    : undefined;
};
