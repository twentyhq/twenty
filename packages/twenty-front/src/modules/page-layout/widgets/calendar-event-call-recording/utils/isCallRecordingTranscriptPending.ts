import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { isCallRecordingTranscriptFailed } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingTranscriptFailed';
import { isCallRecordingTranscriptStatusMarker } from 'twenty-shared/utils';
import { CallRecordingStatus } from '~/generated/graphql';

const IN_PROGRESS_CALL_RECORDING_STATUSES = new Set<CallRecordingStatus>([
  CallRecordingStatus.SCHEDULED,
  CallRecordingStatus.JOINING,
  CallRecordingStatus.RECORDING,
  CallRecordingStatus.PROCESSING,
]);

export const isCallRecordingTranscriptPending = (
  callRecording: CalendarEventCallRecordingCandidate,
): boolean =>
  !isCallRecordingTranscriptFailed(callRecording) &&
  (IN_PROGRESS_CALL_RECORDING_STATUSES.has(callRecording.status) ||
    isCallRecordingTranscriptStatusMarker(callRecording.transcript));
