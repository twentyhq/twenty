import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { t } from '@lingui/core/macro';
import { CallRecordingStatus } from '~/generated/graphql';

type CallRecordingPendingStateDisplayProps = {
  callRecording: Pick<WidgetCallRecordingCandidate, 'status'>;
  generatingTitle: string;
  generatingSubTitle: string;
};

export const CallRecordingPendingStateDisplay = ({
  callRecording,
  generatingTitle,
  generatingSubTitle,
}: CallRecordingPendingStateDisplayProps) => {
  if (callRecording.status === CallRecordingStatus.SCHEDULED) {
    return (
      <CallRecordingWidgetEmptyStateDisplay
        animatedPlaceholderType="emptyTimeline"
        title={t`Recording Scheduled`}
        subTitle={t`A recorder will join when the meeting starts.`}
      />
    );
  }

  if (callRecording.status === CallRecordingStatus.JOINING) {
    return (
      <CallRecordingWidgetEmptyStateDisplay
        animatedPlaceholderType="loadingAccounts"
        title={t`Recorder Joining`}
        subTitle={t`The recorder is joining the call…`}
      />
    );
  }

  if (callRecording.status === CallRecordingStatus.RECORDING) {
    return (
      <CallRecordingWidgetEmptyStateDisplay
        animatedPlaceholderType="loadingMessages"
        title={t`Recording`}
        subTitle={t`This call is being recorded…`}
      />
    );
  }

  return (
    <CallRecordingWidgetEmptyStateDisplay
      animatedPlaceholderType="loadingMessages"
      title={generatingTitle}
      subTitle={generatingSubTitle}
    />
  );
};
