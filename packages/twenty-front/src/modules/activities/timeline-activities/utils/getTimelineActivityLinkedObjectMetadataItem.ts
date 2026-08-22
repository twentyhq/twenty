import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { getTimelineActivityType } from '@/activities/timeline-activities/utils/getTimelineActivityType';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

// Legacy rows encode the linked object in their name, as either
// "linked-<object>.<action>" or "<object>.linked".
const parseLegacyLinkedObjectName = (
  name: string | null | undefined,
): string | undefined => {
  if (!isDefined(name)) {
    return undefined;
  }

  if (name.startsWith('linked-')) {
    return name.split('.')[0].replace('linked-', '');
  }

  if (name.endsWith('.linked')) {
    return name.split('.')[0];
  }

  return undefined;
};

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

  const legacyObjectName = parseLegacyLinkedObjectName(timelineActivity.name);

  if (!isDefined(legacyObjectName)) {
    return undefined;
  }

  return objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === legacyObjectName,
  );
};
