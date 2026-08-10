import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';

export type CalendarEventCallRecordingSelection =
  | {
      state: 'READY';
      entries: CallRecordingParsedTranscriptEntry[];
      callRecording: CalendarEventCallRecordingCandidate;
    }
  | {
      state: 'PENDING' | 'FAILED' | 'EMPTY' | 'MISSING' | 'UNRECOGNIZED';
      callRecording: CalendarEventCallRecordingCandidate;
    }
  | { state: 'NO_RECORDING' };
