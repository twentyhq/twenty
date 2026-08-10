import { type CalendarEventCallRecordingWidgetState } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingWidgetState';
import { type CalendarEventCallRecordingSummaryWidgetState } from '@/page-layout/widgets/call-recording-summary/types/CalendarEventCallRecordingSummaryWidgetState';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const getCalendarEventCallRecordingSummaryWidgetState = ({
  callRecordingState,
  isSummaryFieldMetadataMissing,
  restrictedSummaryFieldLabel,
}: {
  callRecordingState: CalendarEventCallRecordingWidgetState;
  isSummaryFieldMetadataMissing: boolean;
  restrictedSummaryFieldLabel: string | undefined;
}): CalendarEventCallRecordingSummaryWidgetState => {
  if (
    callRecordingState.state === 'UNSUPPORTED' ||
    callRecordingState.state === 'UNAVAILABLE' ||
    callRecordingState.state === 'FORBIDDEN' ||
    callRecordingState.state === 'QUERY_ERROR'
  ) {
    return callRecordingState;
  }

  if (isSummaryFieldMetadataMissing) {
    return { state: 'UNAVAILABLE' };
  }

  if (isDefined(restrictedSummaryFieldLabel)) {
    return {
      state: 'FORBIDDEN',
      restriction: { type: 'field', fieldNames: [restrictedSummaryFieldLabel] },
    };
  }

  if (callRecordingState.state === 'LOADING') {
    return { state: 'LOADING' };
  }

  if (callRecordingState.state === 'NO_RECORDING') {
    return { state: 'NO_RECORDING' };
  }

  const summaryMarkdown = callRecordingState.callRecording.summary?.markdown;

  if (isNonEmptyString(summaryMarkdown) && summaryMarkdown.trim() !== '') {
    return { state: 'READY', markdown: summaryMarkdown };
  }

  if (callRecordingState.state === 'PENDING') {
    return { state: 'PENDING' };
  }

  if (callRecordingState.state === 'FAILED') {
    return { state: 'FAILED' };
  }

  return { state: 'NO_SUMMARY' };
};
