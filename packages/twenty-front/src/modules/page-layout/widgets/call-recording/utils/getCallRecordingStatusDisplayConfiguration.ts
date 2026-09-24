import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { t } from '@lingui/core/macro';
import {
  assertUnreachable,
  isCallRecordingTranscriptStatusMarker,
  isDefined,
} from 'twenty-shared/utils';
import { CallRecordingStatus } from '~/generated/graphql';

export type CallRecordingArtifactType = 'summary' | 'transcript';

type CallRecordingStatusDisplayConfiguration = {
  title: string;
  subTitle: string;
};

export const getCallRecordingStatusDisplayConfiguration = (
  callRecording: Pick<WidgetCallRecordingCandidate, 'status' | 'transcript'>,
  artifactType: CallRecordingArtifactType,
): CallRecordingStatusDisplayConfiguration => {
  if (
    artifactType === 'transcript' &&
    isCallRecordingTranscriptStatusMarker(callRecording.transcript)
  ) {
    switch (callRecording.transcript.status) {
      case 'PENDING':
        return {
          title: t`Preparing Transcript`,
          subTitle: t`The transcript is being prepared…`,
        };
      case 'FAILED':
        return {
          title: t`Transcript Failed`,
          subTitle: t`The transcript could not be generated.`,
        };
      case 'EMPTY':
        if (callRecording.transcript.subCode === 'transcript_expired') {
          return {
            title: t`Transcript Expired`,
            subTitle: t`The transcript expired before it could be imported.`,
          };
        }

        if (!isDefined(callRecording.transcript.subCode)) {
          return {
            title: t`No Speech Detected`,
            subTitle: t`No speech was detected in this recording.`,
          };
        }

        return {
          title: t`Transcript Unavailable`,
          subTitle: t`No transcript is available for this recording.`,
        };
      default:
        return assertUnreachable(callRecording.transcript.status);
    }
  }

  switch (callRecording.status) {
    case CallRecordingStatus.SCHEDULED:
      return {
        title: t`Recording Scheduled`,
        subTitle: t`A recorder will join when the meeting starts.`,
      };
    case CallRecordingStatus.JOINING:
      return {
        title: t`Recorder Joining`,
        subTitle: t`The recorder is joining the call…`,
      };
    case CallRecordingStatus.RECORDING:
      return {
        title: t`Recording`,
        subTitle: t`This call is being recorded…`,
      };
    case CallRecordingStatus.PROCESSING:
      return {
        title: t`Processing Recording`,
        subTitle: t`The call recording is being processed…`,
      };
    case CallRecordingStatus.COMPLETED:
      return artifactType === 'summary'
        ? {
            title: t`Summary Not Available`,
            subTitle: t`A summary is not available for this call recording yet.`,
          }
        : {
            title: t`No Transcript`,
            subTitle: t`No transcript is available for this call recording yet.`,
          };
    case CallRecordingStatus.FAILED:
      return {
        title: t`Recording Failed`,
        subTitle: t`The call recording could not be processed.`,
      };
    case CallRecordingStatus.NOT_RECORDED:
      return {
        title: t`Not Recorded`,
        subTitle: t`This meeting was not recorded.`,
      };
    default:
      return assertUnreachable(callRecording.status);
  }
};
