import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { isCallRecordingTranscriptPending } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingTranscriptPending';

export const isCallRecordingSummaryPending = (
  callRecording: CalendarEventCallRecordingCandidate,
): boolean => isCallRecordingTranscriptPending(callRecording);
