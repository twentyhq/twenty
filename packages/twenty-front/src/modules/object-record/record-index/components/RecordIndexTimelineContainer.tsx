import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordTimeline } from '@/object-record/record-timeline/components/RecordTimeline';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { isDefined } from 'twenty-shared/utils';

export const RecordIndexTimelineContainer = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { currentView } = useGetCurrentViewOnly();

  const startFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === currentView?.startFieldMetadataId,
  );

  if (!isDefined(startFieldMetadataItem)) {
    return null;
  }

  const endFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === currentView?.endFieldMetadataId,
  );

  return (
    <RecordTimeline
      startFieldMetadataItem={startFieldMetadataItem}
      endFieldMetadataItem={endFieldMetadataItem}
    />
  );
};
