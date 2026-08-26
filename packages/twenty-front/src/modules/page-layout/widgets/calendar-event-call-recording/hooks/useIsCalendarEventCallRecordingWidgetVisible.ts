import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCalendarEventTargetRecordId } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCalendarEventTargetRecordId';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useIsCalendarEventCallRecordingWidgetVisible = (): boolean => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const calendarEventTargetRecordId = useCalendarEventTargetRecordId();

  const hasCallRecordingObjectMetadata = objectMetadataItems.some(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === CoreObjectNameSingular.CallRecording,
  );

  return (
    hasCallRecordingObjectMetadata && isDefined(calendarEventTargetRecordId)
  );
};
