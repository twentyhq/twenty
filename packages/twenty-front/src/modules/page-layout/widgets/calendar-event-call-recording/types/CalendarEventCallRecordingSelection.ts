import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';

export type CalendarEventCallRecordingSelection = {
  callRecording: CalendarEventCallRecordingCandidate;
  transcriptEntries: CallRecordingParsedTranscriptEntry[] | undefined;
};
