import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { isCallRecordingTranscriptFailed } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingTranscriptFailed';

export const isCallRecordingSummaryFailed = (
  callRecording: CalendarEventCallRecordingCandidate,
): boolean => isCallRecordingTranscriptFailed(callRecording);
