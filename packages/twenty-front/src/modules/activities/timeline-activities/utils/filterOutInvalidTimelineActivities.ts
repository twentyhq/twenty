import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { findFieldMetadataItemByDiffKey } from '@/activities/timeline-activities/utils/findFieldMetadataItemByDiffKey';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { parseTimelineActivityVerb } from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

const keepActivityWithReadableDiff = (
  timelineActivity: TimelineActivity,
  readableFields: FieldMetadataItem[],
): TimelineActivity | undefined => {
  const validDiffEntries = Object.entries(
    timelineActivity.properties?.diff ?? {},
  ).filter(([diffKey]) =>
    isDefined(findFieldMetadataItemByDiffKey(readableFields, diffKey)),
  );

  if (validDiffEntries.length === 0) {
    return undefined;
  }

  return {
    ...timelineActivity,
    properties: {
      ...timelineActivity.properties,
      diff: Object.fromEntries(validDiffEntries),
    },
  };
};

// Linked activities created before the linkedObjectMetadataId column was
// populated encode the linked object in their name, e.g. "linked-note.updated".
const findLinkedObjectMetadataItem = (
  timelineActivity: TimelineActivity,
  objectMetadataItems: EnrichedObjectMetadataItem[],
): EnrichedObjectMetadataItem | undefined => {
  if (isDefined(timelineActivity.linkedObjectMetadataId)) {
    return objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id === timelineActivity.linkedObjectMetadataId,
    );
  }

  if (timelineActivity.name.startsWith('linked-')) {
    const linkedObjectNameSingular = timelineActivity.name
      .split('.')[0]
      .replace('linked-', '');

    return objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.nameSingular === linkedObjectNameSingular,
    );
  }

  return undefined;
};

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

  return timelineActivities
    .map((timelineActivity) => {
      const linkedObjectMetadataItem = findLinkedObjectMetadataItem(
        timelineActivity,
        objectMetadataItems,
      );

      const verb = parseTimelineActivityVerb(timelineActivity.name);

      if (isDefined(linkedObjectMetadataItem)) {
        if (!isDefined(timelineActivity.properties?.diff)) {
          return timelineActivity;
        }

        return keepActivityWithReadableDiff(
          timelineActivity,
          linkedObjectMetadataItem.readableFields ?? [],
        );
      }

      if (verb === 'updated') {
        return keepActivityWithReadableDiff(
          timelineActivity,
          mainObjectMetadataItem.readableFields,
        );
      }

      return timelineActivity;
    })
    .filter(isDefined);
};
