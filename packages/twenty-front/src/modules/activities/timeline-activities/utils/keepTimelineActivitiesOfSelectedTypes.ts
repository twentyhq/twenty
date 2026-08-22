import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { isDefined } from 'twenty-shared/utils';

// No selection means no filter, so an untouched timeline shows everything
// rather than nothing.
export const keepTimelineActivitiesOfSelectedTypes = <
  TTimelineActivity extends FilterableTimelineActivity,
>(
  timelineActivities: TTimelineActivity[],
  selectedTimelineActivityTypeIds: string[],
): TTimelineActivity[] =>
  selectedTimelineActivityTypeIds.length === 0
    ? timelineActivities
    : timelineActivities.filter(
        (timelineActivity) =>
          isDefined(timelineActivity.timelineActivityTypeId) &&
          selectedTimelineActivityTypeIds.includes(
            timelineActivity.timelineActivityTypeId,
          ),
      );
