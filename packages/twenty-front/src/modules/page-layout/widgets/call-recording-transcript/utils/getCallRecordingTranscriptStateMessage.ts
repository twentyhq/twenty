import { type CalendarEventCallRecordingWidgetState } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingWidgetState';
import { t } from '@lingui/core/macro';

export const getCallRecordingTranscriptStateMessage = (
  state: Exclude<
    CalendarEventCallRecordingWidgetState['state'],
    'LOADING' | 'READY' | 'QUERY_ERROR' | 'FORBIDDEN'
  >,
): string => {
  switch (state) {
    case 'UNSUPPORTED':
      return t`Open a calendar event to view its transcript.`;
    case 'UNAVAILABLE':
      return t`Call recording is not available in this workspace.`;
    case 'NO_RECORDING':
      return t`No call recording exists for this calendar event yet.`;
    case 'PENDING':
      return t`Transcript is being prepared…`;
    case 'FAILED':
      return t`The transcript could not be generated.`;
    case 'EMPTY':
      return t`The transcript is empty.`;
    case 'MISSING':
      return t`No transcript is available for this recording.`;
    case 'UNRECOGNIZED':
      return t`Unrecognized transcript format.`;
  }
};
