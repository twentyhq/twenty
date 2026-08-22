import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { resolveTimelineActivityTypeId } from '@/activities/timeline-activities/utils/resolveTimelineActivityTypeId';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

// No selection means no filter, so an untouched timeline shows everything
// rather than nothing.
export const keepTimelineActivitiesOfSelectedTypes = <
  TTimelineActivity extends FilterableTimelineActivity,
>(
  timelineActivities: TTimelineActivity[],
  selectedTimelineActivityTypeIds: string[],
  timelineActivityTypeById: Map<string, TimelineActivityType>,
  objectMetadataItems: EnrichedObjectMetadataItem[],
): TTimelineActivity[] =>
  selectedTimelineActivityTypeIds.length === 0
    ? timelineActivities
    : timelineActivities.filter((timelineActivity) => {
        const timelineActivityTypeId = resolveTimelineActivityTypeId({
          timelineActivity,
          timelineActivityTypeById,
          objectMetadataItems,
        });

        return (
          isDefined(timelineActivityTypeId) &&
          selectedTimelineActivityTypeIds.includes(timelineActivityTypeId)
        );
      });
