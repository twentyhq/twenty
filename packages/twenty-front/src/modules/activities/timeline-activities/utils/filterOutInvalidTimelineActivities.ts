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

  if (!isDefined(mainObjectMetadataItem)) {
    throw new Error('Object metadata item not found');
  }

  return timelineActivities.filter((timelineActivity) => {
    const [objectName, action] = timelineActivity.name.split('.');
    const diff = timelineActivity.properties?.diff;

    const shouldContainDiff =
      action === 'updated' && !objectName.startsWith('linked-');

    if (!isDefined(diff)) {
      return !shouldContainDiff;
    }

    const diffObjectMetadataItem = objectName.startsWith('linked-')
      ? objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.nameSingular ===
            objectName.replace('linked-', ''),
        )
      : mainObjectMetadataItem;

    const validDiffEntries = Object.entries(diff).filter(([diffKey]) =>
      isDefined(
        findFieldMetadataItemByDiffKey(
          diffObjectMetadataItem?.readableFields ?? [],
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
