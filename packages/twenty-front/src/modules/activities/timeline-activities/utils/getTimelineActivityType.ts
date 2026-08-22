import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { isDefined } from 'twenty-shared/utils';

// Undefined while the types are still loading, and for a row whose type an
// application has since removed.
export const getTimelineActivityType = (
  timelineActivity: FilterableTimelineActivity,
  timelineActivityTypeById: Map<string, TimelineActivityType>,
): TimelineActivityType | undefined =>
  isDefined(timelineActivity.timelineActivityTypeId)
    ? timelineActivityTypeById.get(timelineActivity.timelineActivityTypeId)
    : undefined;
