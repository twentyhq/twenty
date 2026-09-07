import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { isNonEmptyString } from '@sniptt/guards';

export const getCallRecordingSummaryMarkdown = (
  callRecording: Pick<WidgetCallRecordingCandidate, 'summary'> | undefined,
): string | undefined => {
  const trimmedSummaryMarkdown = callRecording?.summary?.markdown?.trim();

  return isNonEmptyString(trimmedSummaryMarkdown)
    ? trimmedSummaryMarkdown
    : undefined;
};
