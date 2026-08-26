import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { isCallRecordingTranscriptFailed } from '@/page-layout/widgets/call-recording/utils/isCallRecordingTranscriptFailed';

export const isCallRecordingSummaryFailed = (
  callRecording: WidgetCallRecordingCandidate,
): boolean => isCallRecordingTranscriptFailed(callRecording);
