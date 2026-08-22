import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { isDefined } from 'twenty-shared/utils';

// Undefined while the types are still loading, and for a row whose type an
// application has since removed.
export const getTimelineActivityType = (
  timelineActivity: FilterableTimelineActivity,
  timelineActivityTypeById: Map<string, TimelineActivityType>,
): TimelineActivityType | undefined => {
  if (isDefined(timelineActivity.timelineActivityTypeSnapshot)) {
    const liveTimelineActivityType = timelineActivityTypeById.get(
      timelineActivity.timelineActivityTypeSnapshot.id,
    );

    return {
      ...timelineActivity.timelineActivityTypeSnapshot,
      // Translation catalogs are resolved by the live metadata API. The
      // snapshot remains the durable fallback after an app is uninstalled.
      label:
        liveTimelineActivityType?.label ??
        timelineActivity.timelineActivityTypeSnapshot.label,
    };
  }

  return isDefined(timelineActivity.timelineActivityTypeId)
    ? timelineActivityTypeById.get(timelineActivity.timelineActivityTypeId)
    : undefined;
};
