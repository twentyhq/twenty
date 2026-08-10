import { type CalendarEventCallRecordingSelection } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingSelection';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';

export type CalendarEventCallRecordingWidgetState =
  | CalendarEventCallRecordingSelection
  | { state: 'LOADING' }
  | { state: 'UNSUPPORTED' }
  | { state: 'UNAVAILABLE' }
  | { state: 'QUERY_ERROR'; error: unknown }
  | { state: 'FORBIDDEN'; restriction: WidgetAccessDenialInfo };
