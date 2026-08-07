import { type CalendarEventCallRecordingTranscriptCandidate } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptCandidate';
import { type CalendarEventCallRecordingTranscriptSelection } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptSelection';
import { isArray } from '@sniptt/guards';
import {
  isCallRecordingTranscriptStatusMarker,
  isDefined,
  parseCallRecordingTranscriptEntries,
} from 'twenty-shared/utils';
import { CallRecordingStatus } from '~/generated/graphql';

const IN_PROGRESS_CALL_RECORDING_STATUSES = new Set<CallRecordingStatus>([
  CallRecordingStatus.SCHEDULED,
  CallRecordingStatus.JOINING,
  CallRecordingStatus.RECORDING,
  CallRecordingStatus.PROCESSING,
]);

const UNAVAILABLE_CALL_RECORDING_STATUSES = new Set<CallRecordingStatus>([
  CallRecordingStatus.FAILED,
  CallRecordingStatus.NOT_RECORDED,
]);

type ClassifiedCallRecordingTranscript = Exclude<
  CalendarEventCallRecordingTranscriptSelection,
  { state: 'NO_RECORDING' }
>;

const classifyCallRecordingTranscript = (
  callRecording: CalendarEventCallRecordingTranscriptCandidate,
): ClassifiedCallRecordingTranscript => {
  const entries = parseCallRecordingTranscriptEntries(callRecording.transcript);

  if (isDefined(entries) && entries.length > 0) {
    return { state: 'READY', callRecording, entries };
  }

  if (UNAVAILABLE_CALL_RECORDING_STATUSES.has(callRecording.status)) {
    return { state: 'FAILED', callRecording };
  }

  if (
    isCallRecordingTranscriptStatusMarker(callRecording.transcript) &&
    callRecording.transcript.status === 'FAILED'
  ) {
    return { state: 'FAILED', callRecording };
  }

  if (IN_PROGRESS_CALL_RECORDING_STATUSES.has(callRecording.status)) {
    return { state: 'PENDING', callRecording };
  }

  if (isCallRecordingTranscriptStatusMarker(callRecording.transcript)) {
    return { state: 'PENDING', callRecording };
  }

  if (isArray(callRecording.transcript)) {
    return { state: 'EMPTY', callRecording };
  }

  if (isDefined(callRecording.transcript)) {
    return { state: 'UNRECOGNIZED', callRecording };
  }

  return { state: 'MISSING', callRecording };
};

// callRecordings are expected in arrival order (createdAt ascending)
export const selectCalendarEventCallRecordingTranscript = (
  callRecordings: CalendarEventCallRecordingTranscriptCandidate[],
): CalendarEventCallRecordingTranscriptSelection => {
  const selections = callRecordings.map(classifyCallRecordingTranscript);

  return (
    selections.find((selection) => selection.state === 'READY') ??
    selections.find((selection) => selection.state === 'PENDING') ??
    selections[0] ?? { state: 'NO_RECORDING' }
  );
};
