import { type CalendarEventCallRecordingTranscriptSelection } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptSelection';

export type CalendarEventCallRecordingTranscriptWidgetState =
  | CalendarEventCallRecordingTranscriptSelection
  | { state: 'LOADING' | 'QUERY_ERROR' | 'FORBIDDEN' | 'UNSUPPORTED' };
