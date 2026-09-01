import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { t } from '@lingui/core/macro';
import {
  assertUnreachable,
  isCallRecordingTranscriptStatusMarker,
} from 'twenty-shared/utils';
import { type AnimatedPlaceholderType } from 'twenty-ui/feedback';
import { CallRecordingStatus } from '~/generated/graphql';

type CallRecordingArtifactType = 'summary' | 'transcript';

type CallRecordingStatusDisplayProps = {
  callRecording: Pick<WidgetCallRecordingCandidate, 'status' | 'transcript'>;
  artifactType: CallRecordingArtifactType;
};

type CallRecordingStatusDisplayConfiguration = {
  animatedPlaceholderType: AnimatedPlaceholderType;
  title: string;
  subTitle: string;
};

const getCompletedCallRecordingStatusDisplayConfiguration = (
  callRecording: Pick<WidgetCallRecordingCandidate, 'transcript'>,
  artifactType: CallRecordingArtifactType,
): CallRecordingStatusDisplayConfiguration => {
  if (
    artifactType === 'transcript' &&
    isCallRecordingTranscriptStatusMarker(callRecording.transcript)
  ) {
    return callRecording.transcript.status === 'PENDING'
      ? {
          animatedPlaceholderType: 'loadingMessages',
          title: t`Preparing Transcript`,
          subTitle: t`The transcript is being prepared…`,
        }
      : {
          animatedPlaceholderType: 'errorIndex',
          title: t`Transcript Failed`,
          subTitle: t`The transcript could not be generated.`,
        };
  }

  return artifactType === 'summary'
    ? {
        animatedPlaceholderType: 'noMatchRecord',
        title: t`No Summary`,
        subTitle: t`No summary is available for this call recording yet.`,
      }
    : {
        animatedPlaceholderType: 'noMatchRecord',
        title: t`No Transcript`,
        subTitle: t`No transcript is available for this call recording yet.`,
      };
};

const getCallRecordingStatusDisplayConfiguration = (
  callRecording: Pick<WidgetCallRecordingCandidate, 'status' | 'transcript'>,
  artifactType: CallRecordingArtifactType,
): CallRecordingStatusDisplayConfiguration => {
  switch (callRecording.status) {
    case CallRecordingStatus.SCHEDULED:
      return {
        animatedPlaceholderType: 'emptyTimeline',
        title: t`Recording Scheduled`,
        subTitle: t`A recorder will join when the meeting starts.`,
      };
    case CallRecordingStatus.JOINING:
      return {
        animatedPlaceholderType: 'loadingAccounts',
        title: t`Recorder Joining`,
        subTitle: t`The recorder is joining the call…`,
      };
    case CallRecordingStatus.RECORDING:
      return {
        animatedPlaceholderType: 'loadingMessages',
        title: t`Recording`,
        subTitle: t`This call is being recorded…`,
      };
    case CallRecordingStatus.PROCESSING:
      return {
        animatedPlaceholderType: 'loadingMessages',
        title: t`Processing Recording`,
        subTitle: t`The call recording is being processed…`,
      };
    case CallRecordingStatus.COMPLETED:
      return getCompletedCallRecordingStatusDisplayConfiguration(
        callRecording,
        artifactType,
      );
    case CallRecordingStatus.FAILED:
      return {
        animatedPlaceholderType: 'errorIndex',
        title: t`Recording Failed`,
        subTitle: t`The call recording could not be processed.`,
      };
    case CallRecordingStatus.NOT_RECORDED:
      return {
        animatedPlaceholderType: 'noMatchRecord',
        title: t`Not Recorded`,
        subTitle: t`This meeting was not recorded.`,
      };
    default:
      return assertUnreachable(callRecording.status);
  }
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
