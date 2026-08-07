import { type CalendarEventCallRecordingTranscriptCandidate } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptCandidate';
import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';

type CalendarEventCallRecordingTranscriptSelectionWithRecording = {
  callRecording: CalendarEventCallRecordingTranscriptCandidate;
};

export type CalendarEventCallRecordingTranscriptSelection =
  | ({
      state: 'READY';
      entries: CallRecordingParsedTranscriptEntry[];
    } & CalendarEventCallRecordingTranscriptSelectionWithRecording)
  | ({
      state: 'PENDING' | 'FAILED' | 'EMPTY' | 'MISSING' | 'UNRECOGNIZED';
    } & CalendarEventCallRecordingTranscriptSelectionWithRecording)
  | { state: 'NO_RECORDING' };
