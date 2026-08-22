import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { getTimelineActivityType } from '@/activities/timeline-activities/utils/getTimelineActivityType';
import {
  parseTimelineActivityAction,
  type TimelineActivityAction,
} from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

export const getTimelineActivityAction = (
  timelineActivity: FilterableTimelineActivity,
  timelineActivityTypeById: Map<string, TimelineActivityType>,
): TimelineActivityAction | null => {
  const timelineActivityType = getTimelineActivityType(
    timelineActivity,
    timelineActivityTypeById,
  );

  if (isDefined(timelineActivityType)) {
    return timelineActivityType.action;
  }

  return isDefined(timelineActivity.name)
    ? parseTimelineActivityAction(timelineActivity.name)
    : null;
};
