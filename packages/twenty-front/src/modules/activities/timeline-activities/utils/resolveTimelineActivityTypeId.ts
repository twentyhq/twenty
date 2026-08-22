import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { getTimelineActivityAction } from '@/activities/timeline-activities/utils/getTimelineActivityAction';
import {
  getTimelineActivityLinkedObjectMetadataItem,
  type TimelineActivityObjectMetadataItem,
} from '@/activities/timeline-activities/utils/getTimelineActivityLinkedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

const getUniqueTimelineActivityTypeId = (
  timelineActivityTypes: TimelineActivityType[],
): string | undefined =>
  timelineActivityTypes.length === 1 ? timelineActivityTypes[0].id : undefined;

export const resolveTimelineActivityTypeId = ({
  timelineActivity,
  timelineActivityTypeById,
  timelineActivityTypes,
  objectMetadataItems,
}: {
  timelineActivity: FilterableTimelineActivity;
  timelineActivityTypeById: Map<string, TimelineActivityType>;
  timelineActivityTypes: TimelineActivityType[];
  objectMetadataItems: TimelineActivityObjectMetadataItem[];
}): string | undefined => {
  if (isDefined(timelineActivity.timelineActivityTypeId)) {
    return timelineActivity.timelineActivityTypeId;
  }

  const action = getTimelineActivityAction(
    timelineActivity,
    timelineActivityTypeById,
  );

  if (!isDefined(action)) {
    return undefined;
  }

  const linkedObjectMetadataItem = getTimelineActivityLinkedObjectMetadataItem({
    timelineActivity,
    timelineActivityTypeById,
    objectMetadataItems,
  });
  if (isDefined(linkedObjectMetadataItem)) {
    const objectBoundTimelineActivityTypes = timelineActivityTypes.filter(
      (timelineActivityType) =>
        timelineActivityType.action === action &&
        timelineActivityType.objectUniversalIdentifier ===
          linkedObjectMetadataItem.universalIdentifier,
    );

    if (objectBoundTimelineActivityTypes.length > 0) {
      return getUniqueTimelineActivityTypeId(objectBoundTimelineActivityTypes);
    }
  }

  return getUniqueTimelineActivityTypeId(
    timelineActivityTypes.filter(
      (timelineActivityType) =>
        timelineActivityType.action === action &&
        !isDefined(timelineActivityType.objectUniversalIdentifier),
    ),
  );
};
