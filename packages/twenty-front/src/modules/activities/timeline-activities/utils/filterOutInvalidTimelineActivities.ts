import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';

// The fields filtering actually reads. Callers keep their own wider row type.
export type FilterableTimelineActivity = Pick<
  TimelineActivity,
  | 'name'
  | 'action'
  | 'sourceObjectMetadataId'
  | 'linkedObjectMetadataId'
  | 'linkedRecordId'
  | 'properties'
>;
import { findFieldMetadataItemByDiffKey } from '@/activities/timeline-activities/utils/findFieldMetadataItemByDiffKey';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getTimelineActivityAction } from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';

const keepActivityWithReadableDiff = <T extends FilterableTimelineActivity>(
  timelineActivity: T,
  readableFields: FieldMetadataItem[],
): T | undefined => {
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

// Activities created before the linkedObjectMetadataId column was populated
// encode the linked object in their name, e.g. "linked-note.updated".
const findLegacyObjectMetadataItemFromName = (
  timelineActivity: FilterableTimelineActivity,
  objectMetadataItems: EnrichedObjectMetadataItem[],
): EnrichedObjectMetadataItem | undefined => {
  if (!timelineActivity.name.startsWith('linked-')) {
    return undefined;
  }

  const linkedObjectNameSingular = timelineActivity.name
    .split('.')[0]
    .replace('linked-', '');

  return objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === linkedObjectNameSingular,
  );
};

// A row about a related record names its object in three places, oldest last:
// the stored source column, the linked column, and the legacy name.
const findLinkedObjectMetadataItem = (
  timelineActivity: FilterableTimelineActivity,
  objectMetadataItems: EnrichedObjectMetadataItem[],
): EnrichedObjectMetadataItem | undefined => {
  if (!isDefined(timelineActivity.linkedRecordId)) {
    return undefined;
  }

  const findById = (
    objectMetadataId: string | null,
  ): EnrichedObjectMetadataItem | undefined =>
    isDefined(objectMetadataId)
      ? objectMetadataItems.find(
          (objectMetadataItem) => objectMetadataItem.id === objectMetadataId,
        )
      : undefined;

  return (
    findById(timelineActivity.sourceObjectMetadataId) ??
    findById(timelineActivity.linkedObjectMetadataId) ??
    findLegacyObjectMetadataItemFromName(timelineActivity, objectMetadataItems)
  );
};

export const filterOutInvalidTimelineActivities = <
  T extends FilterableTimelineActivity,
>(
  timelineActivities: T[],
  mainObjectSingularName: string,
  objectMetadataItems: EnrichedObjectMetadataItem[],
): T[] => {
  const mainObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === mainObjectSingularName,
  );

  if (!isDefined(mainObjectMetadataItem)) {
    throw new Error('Object metadata item not found');
  }

  return timelineActivities
    .map((rawTimelineActivity) => {
      const linkedObjectMetadataItem = findLinkedObjectMetadataItem(
        rawTimelineActivity,
        objectMetadataItems,
      );

      // Resolved once here so the renderer never has to parse a legacy name to
      // work out which object a row came from.
      const timelineActivity: T = isDefined(linkedObjectMetadataItem)
        ? {
            ...rawTimelineActivity,
            sourceObjectMetadataId: linkedObjectMetadataItem.id,
            linkedObjectMetadataId: linkedObjectMetadataItem.id,
          }
        : rawTimelineActivity;

      const action = getTimelineActivityAction(timelineActivity);

      if (isDefined(linkedObjectMetadataItem)) {
        if (!isDefined(timelineActivity.properties?.diff)) {
          return timelineActivity;
        }

        return keepActivityWithReadableDiff(
          timelineActivity,
          linkedObjectMetadataItem.readableFields ?? [],
        );
      }

      if (action === 'updated') {
        return keepActivityWithReadableDiff(
          timelineActivity,
          mainObjectMetadataItem.readableFields,
        );
      }

      return timelineActivity;
    })
    .filter(isDefined);
};
