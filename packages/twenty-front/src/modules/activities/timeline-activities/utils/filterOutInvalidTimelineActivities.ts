import { TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const filterOutInvalidTimelineActivities = (
  timelineActivities: TimelineActivity[],
  mainObjectSingularName: string,
  objectMetadataItems: ObjectMetadataItem[],
): TimelineActivity[] => {
  const mainObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === mainObjectSingularName,
  );

  const noteObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === CoreObjectNameSingular.Note,
  );

  if (!mainObjectMetadataItem || !noteObjectMetadataItem) {
    throw new Error('Object metadata items not found');
  }

  const fieldMetadataItemMap = new Map(
    mainObjectMetadataItem.fields.map((field) => [field.name, field]),
  );

  const noteFieldMetadataItemMap = new Map(
    noteObjectMetadataItem.fields.map((field) => [field.name, field]),
  );

  return timelineActivities.filter((timelineActivity) => {
    const diff = timelineActivity.properties?.diff;
    const canSkipValidation = !diff;

    if (canSkipValidation) {
      return true;
    }

    const isNoteOrTask =
      timelineActivity.name.startsWith('linked-note') ||
      timelineActivity.name.startsWith('linked-task');

    const validDiffEntries = Object.entries(diff).filter(([diffKey]) =>
      isNoteOrTask
        ? // Note and Task objects have the same field metadata
          noteFieldMetadataItemMap.has(diffKey)
        : fieldMetadataItemMap.has(diffKey),
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
