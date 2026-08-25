import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { isNonEmptyString } from '@sniptt/guards';

export const getCallRecordingSummaryMarkdown = (
  callRecording:
    | Pick<CalendarEventCallRecordingCandidate, 'summary'>
    | undefined,
): string | undefined => {
  const trimmedSummaryMarkdown = callRecording?.summary?.markdown?.trim();

  return isNonEmptyString(trimmedSummaryMarkdown)
    ? trimmedSummaryMarkdown
    : undefined;
};
