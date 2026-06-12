import { EventFieldDiff } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiff';
import { findFieldMetadataItemByDiffKey } from '@/activities/timeline-activities/utils/findFieldMetadataItemByDiffKey';
import { isDefined } from 'twenty-shared/utils';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

type EventFieldDiffContainerProps = {
  mainObjectMetadataItem: EnrichedObjectMetadataItem;
  diffKey: string;
  fieldDiff: { before: unknown; after: unknown };
  eventId: string;
};

export const EventFieldDiffContainer = ({
  mainObjectMetadataItem,
  diffKey,
  fieldDiff,
  eventId,
}: EventFieldDiffContainerProps) => {
  const fieldMetadataItem = findFieldMetadataItemByDiffKey(
    mainObjectMetadataItem.fields,
    diffKey,
  );

  if (!isDefined(fieldMetadataItem)) {
    throw new Error(
      `Cannot find field metadata item for field name ${diffKey} on object ${mainObjectMetadataItem.nameSingular}`,
    );
  }

  const diffArtificialRecordStoreId = eventId + '--' + fieldMetadataItem.id;

  return (
    <EventFieldDiff
      key={diffArtificialRecordStoreId}
      fieldDiff={fieldDiff}
      fieldMetadataItem={fieldMetadataItem}
      mainObjectMetadataItem={mainObjectMetadataItem}
      diffArtificialRecordStoreId={diffArtificialRecordStoreId}
    />
  );
};
