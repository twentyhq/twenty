import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCallRecordingWidgetTarget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetTarget';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useIsCallRecordingWidgetVisible = (): boolean => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const callRecordingWidgetTarget = useCallRecordingWidgetTarget();

  const hasCallRecordingObjectMetadata = objectMetadataItems.some(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === CoreObjectNameSingular.CallRecording,
  );

  return hasCallRecordingObjectMetadata && isDefined(callRecordingWidgetTarget);
};
