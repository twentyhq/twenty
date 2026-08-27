import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityTypeMaps } from '@/activities/timeline-activities/types/TimelineActivityTypeMaps';
import { getTimelineActivityType } from '@/activities/timeline-activities/utils/getTimelineActivityType';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getTimelineActivityLinkedObjectMetadataItem = ({
  timelineActivity,
  timelineActivityTypeMaps,
  objectMetadataItems,
}: {
  timelineActivity: FilterableTimelineActivity;
  timelineActivityTypeMaps: TimelineActivityTypeMaps;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): EnrichedObjectMetadataItem | undefined => {
  if (isDefined(timelineActivity.linkedObjectMetadataId)) {
    const linkedObjectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id === timelineActivity.linkedObjectMetadataId,
    );

    if (isDefined(linkedObjectMetadataItem)) {
      return linkedObjectMetadataItem;
    }
  }

  const timelineActivityType = getTimelineActivityType(
    timelineActivity,
    timelineActivityTypeMaps,
  );

  if (isDefined(timelineActivityType?.objectUniversalIdentifier)) {
    return objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.universalIdentifier ===
        timelineActivityType.objectUniversalIdentifier,
    );
  }

  return undefined;
};
