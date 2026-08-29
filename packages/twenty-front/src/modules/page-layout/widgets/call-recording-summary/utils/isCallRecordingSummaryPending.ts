import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { isCallRecordingTranscriptPending } from '@/page-layout/widgets/call-recording/utils/isCallRecordingTranscriptPending';

export const isCallRecordingSummaryPending = (
  callRecording: WidgetCallRecordingCandidate,
): boolean => isCallRecordingTranscriptPending(callRecording);
