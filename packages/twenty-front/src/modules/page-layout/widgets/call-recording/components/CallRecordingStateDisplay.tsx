import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { t } from '@lingui/core/macro';
import {
  assertUnreachable,
  isCallRecordingTranscriptStatusMarker,
} from 'twenty-shared/utils';
import { CallRecordingStatus } from '~/generated/graphql';

type CallRecordingContentType = 'summary' | 'transcript';

type CallRecordingStateDisplayProps = {
  callRecording: Pick<WidgetCallRecordingCandidate, 'status' | 'transcript'>;
  contentType: CallRecordingContentType;
};

type CallRecordingContentStateDisplayProps = {
  status:
    | CallRecordingStatus.PROCESSING
    | CallRecordingStatus.COMPLETED
    | CallRecordingStatus.FAILED;
  contentType: CallRecordingContentType;
};

const CallRecordingContentStateDisplay = ({
  status,
  contentType,
}: CallRecordingContentStateDisplayProps) => {
  switch (status) {
    case CallRecordingStatus.PROCESSING:
      return (
        <CallRecordingWidgetEmptyStateDisplay
          animatedPlaceholderType="loadingMessages"
          title={
            contentType === 'summary'
              ? t`Generating Summary`
              : t`Preparing Transcript`
          }
          subTitle={
            contentType === 'summary'
              ? t`The summary is being generated…`
              : t`Transcript is being prepared…`
          }
        />
      );
    case CallRecordingStatus.COMPLETED:
      return (
        <CallRecordingWidgetEmptyStateDisplay
          animatedPlaceholderType="noMatchRecord"
          title={contentType === 'summary' ? t`No Summary` : t`No Transcript`}
          subTitle={
            contentType === 'summary'
              ? t`No summary has been generated for this call recording yet.`
              : t`No transcript is available for this recording.`
          }
        />
      );
    case CallRecordingStatus.FAILED:
      return (
        <CallRecordingWidgetEmptyStateDisplay
          animatedPlaceholderType="errorIndex"
          title={
            contentType === 'summary'
              ? t`Processing Failed`
              : t`Transcript Failed`
          }
          subTitle={
            contentType === 'summary'
              ? t`The call recording could not be processed.`
              : t`The transcript could not be generated.`
          }
        />
      );
    default:
      return assertUnreachable(status);
  }
};

const getCallRecordingDisplayStatus = ({
  status,
  transcript,
}: Pick<WidgetCallRecordingCandidate, 'status' | 'transcript'>) => {
  const transcriptStatus = isCallRecordingTranscriptStatusMarker(transcript)
    ? transcript.status
    : undefined;

  if (
    status !== CallRecordingStatus.NOT_RECORDED &&
    transcriptStatus === 'FAILED'
  ) {
    return CallRecordingStatus.FAILED;
  }

  if (
    status === CallRecordingStatus.COMPLETED &&
    transcriptStatus === 'PENDING'
  ) {
    return CallRecordingStatus.PROCESSING;
  }

  return status;
};

export const CallRecordingStateDisplay = ({
  callRecording,
  contentType,
}: CallRecordingStateDisplayProps) => {
  const displayStatus = getCallRecordingDisplayStatus(callRecording);

  switch (displayStatus) {
    case CallRecordingStatus.SCHEDULED:
      return (
        <CallRecordingWidgetEmptyStateDisplay
          animatedPlaceholderType="emptyTimeline"
          title={t`Recording Scheduled`}
          subTitle={t`A recorder will join when the meeting starts.`}
        />
      );
    case CallRecordingStatus.JOINING:
      return (
        <CallRecordingWidgetEmptyStateDisplay
          animatedPlaceholderType="loadingAccounts"
          title={t`Recorder Joining`}
          subTitle={t`The recorder is joining the call…`}
        />
      );
    case CallRecordingStatus.RECORDING:
      return (
        <CallRecordingWidgetEmptyStateDisplay
          animatedPlaceholderType="loadingMessages"
          title={t`Recording`}
          subTitle={t`This call is being recorded…`}
        />
      );
    case CallRecordingStatus.PROCESSING:
    case CallRecordingStatus.COMPLETED:
    case CallRecordingStatus.FAILED:
      return (
        <CallRecordingContentStateDisplay
          status={displayStatus}
          contentType={contentType}
        />
      );
    case CallRecordingStatus.NOT_RECORDED:
      return (
        <CallRecordingWidgetEmptyStateDisplay
          animatedPlaceholderType="noMatchRecord"
          title={t`Not Recorded`}
          subTitle={t`This meeting was not recorded.`}
        />
      );
    default:
      return assertUnreachable(displayStatus);
  }
};
