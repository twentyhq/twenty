import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityTypeMaps } from '@/activities/timeline-activities/types/TimelineActivityTypeMaps';
import { getTimelineActivityType } from '@/activities/timeline-activities/utils/getTimelineActivityType';
import { isDefined } from 'twenty-shared/utils';

export const keepTimelineActivitiesOfSelectedTypes = <
  TTimelineActivity extends FilterableTimelineActivity,
>(
  timelineActivities: TTimelineActivity[],
  selectedTimelineActivityTypeUniversalIdentifiers: string[] | null,
  timelineActivityTypeMaps: TimelineActivityTypeMaps,
): TTimelineActivity[] =>
  !isDefined(selectedTimelineActivityTypeUniversalIdentifiers)
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
