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
    return { state: 'READY', entries };
  }

  if (UNAVAILABLE_CALL_RECORDING_STATUSES.has(callRecording.status)) {
    return { state: 'FAILED' };
  }

  if (
    isCallRecordingTranscriptStatusMarker(callRecording.transcript) &&
    callRecording.transcript.status === 'FAILED'
  ) {
    return { state: 'FAILED' };
  }

  if (IN_PROGRESS_CALL_RECORDING_STATUSES.has(callRecording.status)) {
    return { state: 'PENDING' };
  }

  if (isCallRecordingTranscriptStatusMarker(callRecording.transcript)) {
    return { state: 'PENDING' };
  }

  if (isArray(callRecording.transcript)) {
    return { state: 'EMPTY' };
  }

  if (isDefined(callRecording.transcript)) {
    return { state: 'UNRECOGNIZED' };
  }

  return { state: 'MISSING' };
};

export const selectCalendarEventCallRecordingTranscript = (
  callRecordingsInArrivalOrder: CalendarEventCallRecordingTranscriptCandidate[],
): CalendarEventCallRecordingTranscriptSelection => {
  let firstPendingSelection: ClassifiedCallRecordingTranscript | undefined;
  let firstSelection: ClassifiedCallRecordingTranscript | undefined;

  for (const callRecording of callRecordingsInArrivalOrder) {
    const selection = classifyCallRecordingTranscript(callRecording);

    if (selection.state === 'READY') {
      return selection;
    }

    if (!isDefined(firstPendingSelection) && selection.state === 'PENDING') {
      firstPendingSelection = selection;
    }

    firstSelection ??= selection;
  }

  return firstPendingSelection ?? firstSelection ?? { state: 'NO_RECORDING' };
};
