import { EventFieldDiff } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiff';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type EventFieldDiffContainerProps = {
  mainObjectMetadataItem: ObjectMetadataItem;
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

  if (!fieldMetadataItem) {
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
