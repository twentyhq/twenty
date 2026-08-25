import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { isCallRecordingTranscriptFailed } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingTranscriptFailed';
import { isCallRecordingTranscriptPending } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingTranscriptPending';
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
  callRecording: CalendarEventCallRecordingCandidate;
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

  if (isCallRecordingTranscriptPending(callRecording)) {
    return (
      <StyledEmptyStateScrollContainer>
        <CallRecordingWidgetEmptyStateDisplay
          animatedPlaceholderType="loadingMessages"
          title={t`Preparing Transcript`}
          subTitle={t`Transcript is being prepared…`}
        />
      </StyledEmptyStateScrollContainer>
    );
  }

  if (isCallRecordingTranscriptFailed(callRecording)) {
    return (
      <StyledEmptyStateScrollContainer>
        <CallRecordingWidgetEmptyStateDisplay
          animatedPlaceholderType="errorIndex"
          title={t`Transcript Failed`}
          subTitle={t`The transcript could not be generated.`}
        />
      </StyledEmptyStateScrollContainer>
    );
  }

  return (
    <StyledEmptyStateScrollContainer>
      <CallRecordingWidgetEmptyStateDisplay
        animatedPlaceholderType="noMatchRecord"
        title={t`No Transcript`}
        subTitle={t`No transcript is available for this recording.`}
      />
    </StyledEmptyStateScrollContainer>
  );
};
