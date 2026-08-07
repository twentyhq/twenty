import { type CalendarEventCallRecordingTranscriptSelection } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptSelection';

export type CalendarEventCallRecordingTranscriptWidgetState =
  | CalendarEventCallRecordingTranscriptSelection
  | {
      state: 'LOADING';
      loadingPhase: 'INITIAL' | 'ADDITIONAL_PAGE';
    }
  | { state: 'QUERY_ERROR' | 'FORBIDDEN' | 'UNSUPPORTED' };
