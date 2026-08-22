import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { type TimelineActivityObjectMetadataItem } from '@/activities/timeline-activities/utils/getTimelineActivityLinkedObjectMetadataItem';
import { resolveTimelineActivityTypeId } from '@/activities/timeline-activities/utils/resolveTimelineActivityTypeId';
import { isDefined } from 'twenty-shared/utils';

type KeepTimelineActivitiesOfSelectedTypesArgs<
  TTimelineActivity extends FilterableTimelineActivity,
> = {
  timelineActivities: TTimelineActivity[];
  selectedTimelineActivityTypeIds: string[];
  timelineActivityTypeById: Map<string, TimelineActivityType>;
  objectMetadataItems: TimelineActivityObjectMetadataItem[];
};

// No selection means no filter, so an untouched timeline shows everything
// rather than nothing.
export const keepTimelineActivitiesOfSelectedTypes = <
  TTimelineActivity extends FilterableTimelineActivity,
>({
  timelineActivities,
  selectedTimelineActivityTypeIds,
  timelineActivityTypeById,
  objectMetadataItems,
}: KeepTimelineActivitiesOfSelectedTypesArgs<TTimelineActivity>): TTimelineActivity[] => {
  if (selectedTimelineActivityTypeIds.length === 0) {
    return timelineActivities;
  }

  const selectedTimelineActivityTypeIdSet = new Set(
    selectedTimelineActivityTypeIds,
  );
  const timelineActivityTypes = [...timelineActivityTypeById.values()];

  return timelineActivities.filter((timelineActivity) => {
    const timelineActivityTypeId = resolveTimelineActivityTypeId({
      timelineActivity,
      timelineActivityTypeById,
      timelineActivityTypes,
      objectMetadataItems,
    });

    return (
      isDefined(timelineActivityTypeId) &&
      selectedTimelineActivityTypeIdSet.has(timelineActivityTypeId)
    );
  });
};
