import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const filterOutInvalidEvents = (
  events: TimelineActivity[],
  mainObjectMetadataItem: ObjectMetadataItem,
): TimelineActivity[] => {
  const fieldMetadataItemMap = new Map(
    mainObjectMetadataItem.fields.map((field) => [field.name, field]),
  );

  return events.filter((event) => {
    const diff = event.properties?.diff;
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

    event.properties = {
      ...event.properties,
      diff: Object.fromEntries(validDiffEntries),
    };

    return true;
  });
};
