import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { getTimelineActivityType } from '@/activities/timeline-activities/utils/getTimelineActivityType';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getTimelineActivityLinkedObjectMetadataItem = ({
  timelineActivity,
  timelineActivityTypeById,
  objectMetadataItems,
}: {
  timelineActivity: FilterableTimelineActivity;
  timelineActivityTypeById: Map<string, TimelineActivityType>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): EnrichedObjectMetadataItem | undefined => {
  if (isDefined(timelineActivity.linkedObjectMetadataId)) {
    return objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id === timelineActivity.linkedObjectMetadataId,
    );
  }

  const timelineActivityType = getTimelineActivityType(
    timelineActivity,
    timelineActivityTypeById,
  );

  if (isDefined(timelineActivityType?.objectUniversalIdentifier)) {
    return objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.universalIdentifier ===
        timelineActivityType.objectUniversalIdentifier,
    );
  }

  const legacyObjectName = timelineActivity.name?.startsWith('linked-')
    ? timelineActivity.name.split('.')[0].replace('linked-', '')
    : timelineActivity.name?.endsWith('.linked')
      ? timelineActivity.name.split('.')[0]
      : undefined;

  return isDefined(legacyObjectName)
    ? objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === legacyObjectName,
      )
    : undefined;
};
