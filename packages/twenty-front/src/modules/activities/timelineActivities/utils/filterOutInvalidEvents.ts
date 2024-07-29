import { TimelineActivity } from '@/activities/timelineActivities/types/TimelineActivity';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from '~/utils/isDefined';

export const filterOutInvalidEvents = (
  events: TimelineActivity[],
  mainObjectMetadataItem: ObjectMetadataItem,
) => {
  const fieldMetadataItemMap: Record<string, FieldMetadataItem> =
    mainObjectMetadataItem.fields.reduce(
      (acc, field) => ({ ...acc, [field.name]: field }),
      {},
    );

  const filteredEvents = events.reduce(
    (acc: TimelineActivity[], event: TimelineActivity) => {
      const { properties } = event;
      const diff: Record<string, { before: any; after: any }> =
        properties?.diff;

      if (!isDefined(diff)) {
        acc.push(event);

        return acc;
      }

      const diffEntriesWithoutDeletedFields = Object.entries(diff).filter(
        ([diffKey, _diffValue]) => fieldMetadataItemMap[diffKey],
      );

      if (diffEntriesWithoutDeletedFields.length > 0) {
        acc.push({
          ...event,
          properties: {
            ...properties,
            diff: Object.fromEntries(diffEntriesWithoutDeletedFields),
          },
        });
      }

      return acc;
    },
    [],
  );

  return filteredEvents;
};
