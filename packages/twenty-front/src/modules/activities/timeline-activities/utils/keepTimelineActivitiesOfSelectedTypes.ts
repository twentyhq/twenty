import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityTypeMaps } from '@/activities/timeline-activities/types/TimelineActivityTypeMaps';
import { getTimelineActivityType } from '@/activities/timeline-activities/utils/getTimelineActivityType';
import { isDefined } from 'twenty-shared/utils';

// No selection means no filter, so an untouched timeline shows everything
// rather than nothing.
export const keepTimelineActivitiesOfSelectedTypes = <
  TTimelineActivity extends FilterableTimelineActivity,
>(
  timelineActivities: TTimelineActivity[],
  selectedTimelineActivityTypeUniversalIdentifiers: string[],
  timelineActivityTypeMaps: TimelineActivityTypeMaps,
): TTimelineActivity[] =>
  selectedTimelineActivityTypeUniversalIdentifiers.length === 0
    ? timelineActivities
    : timelineActivities.filter((timelineActivity) => {
        const timelineActivityTypeUniversalIdentifier = getTimelineActivityType(
          timelineActivity,
          timelineActivityTypeMaps,
        )?.universalIdentifier;

        return (
          isDefined(timelineActivityTypeUniversalIdentifier) &&
          selectedTimelineActivityTypeUniversalIdentifiers.includes(
            timelineActivityTypeUniversalIdentifier,
          )
        );
      });
