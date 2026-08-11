import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { isCallRecordingInProgress } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingInProgress';
import { isCallRecordingTranscriptFailed } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingTranscriptFailed';
import { isCallRecordingTranscriptStatusMarker } from 'twenty-shared/utils';

export const isCallRecordingTranscriptPending = (
  callRecording: CalendarEventCallRecordingCandidate,
): boolean =>
  !isCallRecordingTranscriptFailed(callRecording) &&
  (isCallRecordingInProgress(callRecording) ||
    isCallRecordingTranscriptStatusMarker(callRecording.transcript));
