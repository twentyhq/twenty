import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { CallRecordingTranscriptEntryList } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryList';
import { type CallRecordingTranscriptPlayback } from '@/page-layout/widgets/call-recording-transcript/types/CallRecordingTranscriptPlayback';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

const StyledEmptyStateScrollContainer = styled.div`
  min-height: 0;
  overflow-y: auto;
`;

type CallRecordingTranscriptContentProps = {
  transcriptEntries: CallRecordingParsedTranscriptEntry[] | undefined;
  playback?: CallRecordingTranscriptPlayback;
};

export const CallRecordingTranscriptContent = ({
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
      <CallRecordingWidgetEmptyStateDisplay
        animatedPlaceholderType="noMatchRecord"
        title={t`No Transcript`}
        subTitle={t`This call recording does not have a transcript.`}
      />
    </StyledEmptyStateScrollContainer>
  );
};
