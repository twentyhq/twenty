import { type CallRecordingTranscriptEntryPlaybackPhase } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptEntryPlaybackPhase';
import { isDefined } from 'twenty-shared/utils';

export const getCallRecordingTranscriptEntryPlaybackPhase = ({
  activeEntryIndex,
  entryIndex,
  lastStartedEntryIndex,
}: {
  activeEntryIndex: number | undefined;
  entryIndex: number;
  lastStartedEntryIndex: number | undefined;
}): CallRecordingTranscriptEntryPlaybackPhase | undefined => {
  if (!isDefined(lastStartedEntryIndex) || lastStartedEntryIndex === -1) {
    return undefined;
  }

  if (entryIndex === activeEntryIndex) {
    return 'speaking';
  }

  if (entryIndex <= lastStartedEntryIndex) {
    return 'spoken';
  }

  return 'upcoming';
};
