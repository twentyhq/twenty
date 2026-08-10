import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';

export type CalendarEventCallRecordingSummaryWidgetState =
  | { state: 'READY'; markdown: string }
  | {
      state:
        | 'LOADING'
        | 'UNSUPPORTED'
        | 'UNAVAILABLE'
        | 'NO_RECORDING'
        | 'NO_SUMMARY'
        | 'PENDING'
        | 'FAILED';
    }
  | { state: 'QUERY_ERROR'; error: unknown }
  | { state: 'FORBIDDEN'; restriction: WidgetAccessDenialInfo };
