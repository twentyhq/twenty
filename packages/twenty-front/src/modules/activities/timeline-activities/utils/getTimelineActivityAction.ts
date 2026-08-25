import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityTypeMaps } from '@/activities/timeline-activities/types/TimelineActivityTypeMaps';
import { getTimelineActivityType } from '@/activities/timeline-activities/utils/getTimelineActivityType';
import { type TimelineActivityAction } from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

export const getTimelineActivityAction = (
  timelineActivity: FilterableTimelineActivity,
  timelineActivityTypeMaps: TimelineActivityTypeMaps,
): TimelineActivityAction | null => {
  const timelineActivityType = getTimelineActivityType(
    timelineActivity,
    timelineActivityTypeMaps,
  );

  if (isDefined(timelineActivityType)) {
    return timelineActivityType.action;
  }

  return null;
};
