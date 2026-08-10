import { type CalendarEventCallRecordingSummaryWidgetState } from '@/page-layout/widgets/call-recording-summary/types/CalendarEventCallRecordingSummaryWidgetState';
import { t } from '@lingui/core/macro';

export const getCallRecordingSummaryStateMessage = (
  state: Exclude<
    CalendarEventCallRecordingSummaryWidgetState['state'],
    'LOADING' | 'READY' | 'QUERY_ERROR' | 'FORBIDDEN'
  >,
): string => {
  switch (state) {
    case 'UNSUPPORTED':
      return t`Open a calendar event to view its summary.`;
    case 'UNAVAILABLE':
      return t`Call recording is not available in this workspace.`;
    case 'NO_RECORDING':
      return t`No call recording exists for this calendar event yet.`;
    case 'PENDING':
      return t`The call recording is still being processed…`;
    case 'FAILED':
      return t`The call recording could not be processed.`;
    case 'NO_SUMMARY':
      return t`No summary has been generated for this call recording yet.`;
  }
};
