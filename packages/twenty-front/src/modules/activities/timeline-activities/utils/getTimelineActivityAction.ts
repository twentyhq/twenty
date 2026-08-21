import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { type TimelineActivityAction } from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

// An application-declared type has no action and renders generically, which is
// also what a row whose type has not loaded yet gets.
export const getTimelineActivityAction = (
  timelineActivity: FilterableTimelineActivity,
  timelineActivityTypeById: Map<string, TimelineActivityType>,
): TimelineActivityAction | null => {
  if (!isDefined(timelineActivity.timelineActivityTypeId)) {
    return null;
  }

  return (
    timelineActivityTypeById.get(timelineActivity.timelineActivityTypeId)
      ?.action ?? null
  );
};
