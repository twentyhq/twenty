import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import {
  type CallRecordingArtifactType,
  getCallRecordingStatusDisplayConfiguration,
} from '@/page-layout/widgets/call-recording/utils/getCallRecordingStatusDisplayConfiguration.util';

type CallRecordingStatusDisplayProps = {
  callRecording: Pick<WidgetCallRecordingCandidate, 'status' | 'transcript'>;
  artifactType: CallRecordingArtifactType;
};

export const CallRecordingStatusDisplay = ({
  callRecording,
  artifactType,
}: CallRecordingStatusDisplayProps) => {
  const { animatedPlaceholderType, title, subTitle } =
    getCallRecordingStatusDisplayConfiguration(callRecording, artifactType);

  return (
    <CallRecordingWidgetEmptyStateDisplay
      animatedPlaceholderType={animatedPlaceholderType}
      title={title}
      subTitle={subTitle}
    />
  );
};
