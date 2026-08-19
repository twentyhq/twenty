import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { isCallRecordingTranscriptStatusMarker } from 'twenty-shared/utils';
import { CallRecordingStatus } from '~/generated/graphql';

const UNAVAILABLE_CALL_RECORDING_STATUSES = new Set<CallRecordingStatus>([
  CallRecordingStatus.FAILED,
  CallRecordingStatus.NOT_RECORDED,
]);

export const isCallRecordingTranscriptFailed = (
  callRecording: CalendarEventCallRecordingCandidate,
): boolean =>
  UNAVAILABLE_CALL_RECORDING_STATUSES.has(callRecording.status) ||
  (isCallRecordingTranscriptStatusMarker(callRecording.transcript) &&
    callRecording.transcript.status === 'FAILED');
