import { type CallRecordingTranscriptEntryPlaybackPhase } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptEntryPlaybackPhase';
import { type CallRecordingTranscriptPlaybackPosition } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptPlaybackPosition';
import { isDefined } from 'twenty-shared/utils';

export const getCallRecordingTranscriptEntryPlaybackPhase = ({
  entryIndex,
  playbackPosition,
}: {
  entryIndex: number;
  playbackPosition: CallRecordingTranscriptPlaybackPosition | undefined;
}): CallRecordingTranscriptEntryPlaybackPhase | undefined => {
  if (
    !isDefined(playbackPosition) ||
    playbackPosition.lastStartedIndex === -1
  ) {
    return undefined;
  }

  if (entryIndex === playbackPosition.activeIndex) {
    return 'speaking';
  }

  if (entryIndex <= playbackPosition.lastStartedIndex) {
    return 'spoken';
  }

  return 'upcoming';
};
