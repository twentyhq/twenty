import { EventFieldDiff } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiff';
import { isDefined } from 'twenty-shared/utils';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

type EventFieldDiffContainerProps = {
  mainObjectMetadataItem: ObjectMetadataItem;
  diffKey: string;
  diffValue: any;
  diffBeforeValue?: any;
  eventId: string;
  fieldMetadataItemMap: Record<string, FieldMetadataItem>;
};

export const EventFieldDiffContainer = ({
  mainObjectMetadataItem,
  diffKey,
  diffValue,
  diffBeforeValue,
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
      diffBeforeRecord={diffBeforeValue}
      fieldMetadataItem={fieldMetadataItem}
      mainObjectMetadataItem={mainObjectMetadataItem}
      diffArtificialRecordStoreId={diffArtificialRecordStoreId}
    />
  );
};
