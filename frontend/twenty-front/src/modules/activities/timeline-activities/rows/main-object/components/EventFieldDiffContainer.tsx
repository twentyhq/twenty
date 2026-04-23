import { EventFieldDiff } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiff';
import { isDefined } from 'twenty-shared/utils';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

type EventFieldDiffContainerProps = {
  mainObjectMetadataItem: EnrichedObjectMetadataItem;
  diffKey: string;
  diffValue: any;
  eventId: string;
  fieldMetadataItemMap: Record<string, FieldMetadataItem>;
};

export const EventFieldDiffContainer = ({
  mainObjectMetadataItem,
  diffKey,
  diffValue,
  eventId,
  fieldMetadataItemMap,
}: EventFieldDiffContainerProps) => {
  const fieldMetadataItem = fieldMetadataItemMap[diffKey];

  if (!isDefined(fieldMetadataItem)) {
    throw new Error(
      `Cannot find field metadata item for field name ${diffKey} on object ${mainObjectMetadataItem.nameSingular}`,
    );
  }

  const diffArtificialRecordStoreId = eventId + '--' + fieldMetadataItem.id;

  return (
    <EventFieldDiff
      key={diffArtificialRecordStoreId}
      diffRecord={diffValue}
      fieldMetadataItem={fieldMetadataItem}
      mainObjectMetadataItem={mainObjectMetadataItem}
      diffArtificialRecordStoreId={diffArtificialRecordStoreId}
    />
  );
};
