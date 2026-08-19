import { getTimelineActivityTargetObjectMetadataList } from '@/activities/timeline-activities/utils/getTimelineActivityTargetObjectMetadataList';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';

type GetObjectHasTimelineActivitiesArgs = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
};

// Same eligibility as the record page timeline tab.
export const getObjectHasTimelineActivities = ({
  objectMetadataItem,
  objectMetadataItems,
}: GetObjectHasTimelineActivitiesArgs): boolean => {
  const timelineActivityObjectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === CoreObjectNameSingular.TimelineActivity,
  );

  return getTimelineActivityTargetObjectMetadataList(
    timelineActivityObjectMetadataItem?.fields ?? [],
  ).some(
    (targetObjectMetadata) => targetObjectMetadata.id === objectMetadataItem.id,
  );
};
