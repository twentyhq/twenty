import { type CalendarEventCallRecordingTranscriptSelection } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptSelection';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';

export type CalendarEventCallRecordingTranscriptWidgetState =
  | CalendarEventCallRecordingTranscriptSelection
  | { state: 'LOADING' | 'UNSUPPORTED' | 'UNAVAILABLE' }
  | { state: 'QUERY_ERROR'; error: unknown }
  | { state: 'FORBIDDEN'; restriction: WidgetAccessDenialInfo };
