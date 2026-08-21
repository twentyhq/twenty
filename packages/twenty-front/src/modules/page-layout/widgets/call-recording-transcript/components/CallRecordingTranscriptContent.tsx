import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { isCallRecordingTranscriptFailed } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingTranscriptFailed';
import { isCallRecordingTranscriptPending } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingTranscriptPending';
import { CallRecordingTranscriptEntryList } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryList';
import { t } from '@lingui/core/macro';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

type CallRecordingTranscriptContentProps = {
  callRecording: CalendarEventCallRecordingCandidate;
  transcriptEntries: CallRecordingParsedTranscriptEntry[] | undefined;
  activeEntryIndex?: number;
  lastStartedEntryIndex?: number;
  videoElement?: HTMLVideoElement | null;
  onEntrySelect?: (entryStartSeconds: number) => void;
};

export const CallRecordingTranscriptContent = ({
  callRecording,
  transcriptEntries,
  activeEntryIndex,
  lastStartedEntryIndex,
  videoElement,
  onEntrySelect,
}: CallRecordingTranscriptContentProps) => {
  if (isNonEmptyArray(transcriptEntries)) {
    return (
      <CallRecordingTranscriptEntryList
        entries={transcriptEntries}
        activeEntryIndex={activeEntryIndex}
        lastStartedEntryIndex={lastStartedEntryIndex}
        videoElement={videoElement}
        onEntrySelect={onEntrySelect}
      />
    );
  }

  if (isCallRecordingTranscriptPending(callRecording)) {
    return (
      <CallRecordingWidgetEmptyStateDisplay
        animatedPlaceholderType="loadingMessages"
        title={t`Preparing Transcript`}
        subTitle={t`Transcript is being prepared…`}
      />
    );
  }

  if (isCallRecordingTranscriptFailed(callRecording)) {
    return (
      <CallRecordingWidgetEmptyStateDisplay
        animatedPlaceholderType="errorIndex"
        title={t`Transcript Failed`}
        subTitle={t`The transcript could not be generated.`}
      />
    );
  }

  return (
    <CallRecordingWidgetEmptyStateDisplay
      animatedPlaceholderType="noMatchRecord"
      title={t`No Transcript`}
      subTitle={t`No transcript is available for this recording.`}
    />
  );
};
