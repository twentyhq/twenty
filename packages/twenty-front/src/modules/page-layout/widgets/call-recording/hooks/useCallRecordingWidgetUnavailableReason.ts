import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCallRecordingWidgetTarget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetTarget';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type CallRecordingWidgetUnavailableReason =
  | 'workspaceWithoutCallRecording'
  | 'recordWithoutCallRecording';

export const useCallRecordingWidgetUnavailableReason = ():
  | CallRecordingWidgetUnavailableReason
  | undefined => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const callRecordingWidgetTarget = useCallRecordingWidgetTarget();

  const hasCallRecordingObjectMetadata = objectMetadataItems.some(
    (objectMetadataItem) =>
      objectMetadataItem.nameSingular === CoreObjectNameSingular.CallRecording,
  );

  if (!hasCallRecordingObjectMetadata) {
    return 'workspaceWithoutCallRecording';
  }

  if (!isDefined(callRecordingWidgetTarget)) {
    return 'recordWithoutCallRecording';
  }

  return undefined;
};
