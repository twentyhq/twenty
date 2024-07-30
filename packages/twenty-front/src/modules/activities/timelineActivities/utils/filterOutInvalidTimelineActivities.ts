import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const filterOutInvalidTimelineActivities = (
  timelineActivities: TimelineActivity[],
  mainObjectMetadataItem: ObjectMetadataItem,
): TimelineActivity[] => {
  const fieldMetadataItemMap = new Map(
    mainObjectMetadataItem.fields.map((field) => [field.name, field]),
  );

  return timelineActivities.filter((timelineActivity) => {
    const diff = timelineActivity.properties?.diff;
    const canSkipValidation = !diff;

    if (canSkipValidation) {
      return true;
    }

    const validDiffEntries = Object.entries(diff).filter(([diffKey]) =>
      fieldMetadataItemMap.has(diffKey),
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
