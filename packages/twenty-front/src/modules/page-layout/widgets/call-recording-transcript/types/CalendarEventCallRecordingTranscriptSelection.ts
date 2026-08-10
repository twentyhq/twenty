import { type CallRecordingParsedTranscriptEntry } from 'twenty-shared/types';

export type CalendarEventCallRecordingTranscriptSelection =
  | {
      state: 'READY';
      entries: CallRecordingParsedTranscriptEntry[];
    }
  | { state: 'PENDING' | 'FAILED' | 'EMPTY' | 'MISSING' | 'UNRECOGNIZED' }
  | { state: 'NO_RECORDING' };
