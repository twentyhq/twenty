import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { findFieldMetadataItemByDiffKey } from '@/activities/timeline-activities/utils/findFieldMetadataItemByDiffKey';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const filterOutInvalidTimelineActivities = (
  timelineActivities: TimelineActivity[],
  mainObjectSingularName: string,
  objectMetadataItems: EnrichedObjectMetadataItem[],
): TimelineActivity[] => {
  const mainObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === mainObjectSingularName,
  );

  if (!mainObjectMetadataItem) {
    throw new Error('Object metadata item not found');
  }

  return timelineActivities.filter((timelineActivity) => {
    const [objectName, action] = timelineActivity.name.split('.');

    // Only main-object update events render a field diff. Created, deleted and
    // restored events, and linked note/task rows, render without one.
    const isMainObjectUpdate =
      action === 'updated' && !objectName.startsWith('linked-');

    if (!isMainObjectUpdate) {
      return true;
    }

    const validDiffEntries = Object.entries(
      timelineActivity.properties?.diff ?? {},
    ).filter(([diffKey]) =>
      isDefined(
        findFieldMetadataItemByDiffKey(
          mainObjectMetadataItem.readableFields,
          diffKey,
        ),
      ),
    );

    if (validDiffEntries.length === 0) {
      return false;
    }

    timelineActivity.properties = {
      ...timelineActivity.properties,
      diff: Object.fromEntries(validDiffEntries),
    };

    return true;
  });
};
