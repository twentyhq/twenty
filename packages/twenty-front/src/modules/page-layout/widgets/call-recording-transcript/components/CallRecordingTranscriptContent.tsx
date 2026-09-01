import { CallRecordingStateDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingStateDisplay';
import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { CallRecordingTranscriptEntryList } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryList';
import { type CallRecordingTranscriptPlayback } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptPlayback';
import { styled } from '@linaria/react';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

const StyledEmptyStateScrollContainer = styled.div`
  min-height: 0;
  overflow-y: auto;
`;

type CallRecordingTranscriptContentProps = {
  callRecording: WidgetCallRecordingCandidate;
  transcriptEntries: CallRecordingParsedTranscriptEntry[] | undefined;
  playback?: CallRecordingTranscriptPlayback;
};

export const CallRecordingTranscriptContent = ({
  callRecording,
  transcriptEntries,
  playback,
}: CallRecordingTranscriptContentProps) => {
  if (isNonEmptyArray(transcriptEntries)) {
    return (
      <CallRecordingTranscriptEntryList
        entries={transcriptEntries}
        playback={playback}
      />
    );
  }

  return (
    <StyledEmptyStateScrollContainer>
      <CallRecordingStateDisplay
        callRecording={callRecording}
        contentType="transcript"
      />
    </StyledEmptyStateScrollContainer>
  );
};
