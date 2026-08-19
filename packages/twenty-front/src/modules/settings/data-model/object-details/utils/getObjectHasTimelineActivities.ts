import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type GetObjectHasTimelineActivitiesArgs = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
};

// Same eligibility as the record page timeline tab: the timelineActivity
// object carries one morph target field per object whose records have one.
export const getObjectHasTimelineActivities = ({
  objectMetadataItem,
  objectMetadataItems,
}: GetObjectHasTimelineActivitiesArgs): boolean => {
  const timelineActivityObjectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === CoreObjectNameSingular.TimelineActivity,
  );

  return (timelineActivityObjectMetadataItem?.fields ?? []).some(
    (field) =>
      isDefined(field.morphRelations) &&
      field.morphRelations.some(
        (morphRelation) =>
          morphRelation.targetObjectMetadata.id === objectMetadataItem.id,
      ),
  );
};
