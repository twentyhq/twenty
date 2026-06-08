import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { findFieldMetadataItemByDiffKey } from '@/activities/timeline-activities/utils/findFieldMetadataItemByDiffKey';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
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

  const noteObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === CoreObjectNameSingular.Note,
  );

  if (!mainObjectMetadataItem || !noteObjectMetadataItem) {
    throw new Error('Object metadata items not found');
  }

  return timelineActivities.filter((timelineActivity) => {
    const diff = timelineActivity.properties?.diff;
    const canSkipValidation = !diff;

    if (canSkipValidation) {
      return true;
    }

    const isNoteOrTask =
      timelineActivity.name.startsWith('linked-note') ||
      timelineActivity.name.startsWith('linked-task');

    const fieldsToValidateAgainst = isNoteOrTask
      ? noteObjectMetadataItem.readableFields
      : mainObjectMetadataItem.readableFields;

    const validDiffEntries = Object.entries(diff).filter(([diffKey]) =>
      isDefined(
        findFieldMetadataItemByDiffKey(fieldsToValidateAgainst, diffKey),
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
