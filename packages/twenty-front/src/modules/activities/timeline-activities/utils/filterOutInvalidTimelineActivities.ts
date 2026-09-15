import { type FilterableTimelineActivity } from '@/activities/timeline-activities/types/FilterableTimelineActivity';
import { type TimelineActivityTypeMaps } from '@/activities/timeline-activities/types/TimelineActivityTypeMaps';
import { findFieldMetadataItemByDiffKey } from '@/activities/timeline-activities/utils/findFieldMetadataItemByDiffKey';
import { getTimelineActivityAction } from '@/activities/timeline-activities/utils/getTimelineActivityAction';
import { getTimelineActivityLinkedObjectMetadataItem } from '@/activities/timeline-activities/utils/getTimelineActivityLinkedObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

const keepActivityWithReadableDiff = <
  TTimelineActivity extends FilterableTimelineActivity,
>(
  timelineActivity: TTimelineActivity,
  readableFields: FieldMetadataItem[],
): TTimelineActivity | undefined => {
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

export const filterOutInvalidTimelineActivities = <
  TTimelineActivity extends FilterableTimelineActivity,
>(
  timelineActivities: TTimelineActivity[],
  mainObjectSingularName: string,
  objectMetadataItems: EnrichedObjectMetadataItem[],
  timelineActivityTypeMaps: TimelineActivityTypeMaps,
): TTimelineActivity[] => {
  const mainObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === mainObjectSingularName,
  );

  if (!isDefined(mainObjectMetadataItem)) {
    throw new Error('Object metadata item not found');
  }

  return timelineActivities
    .map((timelineActivity) => {
      const linkedObjectMetadataItem =
        getTimelineActivityLinkedObjectMetadataItem({
          timelineActivity,
          timelineActivityTypeMaps,
          objectMetadataItems,
        });

      const action = getTimelineActivityAction(
        timelineActivity,
        timelineActivityTypeMaps,
      );

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
