import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { type CalendarEventCallRecordingSelection } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingSelection';
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

type ClassifiedCallRecording = Exclude<
  CalendarEventCallRecordingSelection,
  { state: 'NO_RECORDING' }
>;

const classifyCallRecording = (
  callRecording: CalendarEventCallRecordingCandidate,
): ClassifiedCallRecording => {
  const entries = parseCallRecordingTranscriptEntries(callRecording.transcript);

  if (isDefined(entries) && entries.length > 0) {
    return { state: 'READY', entries, callRecording };
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

export const selectCalendarEventCallRecording = (
  callRecordingsInArrivalOrder: CalendarEventCallRecordingCandidate[],
): CalendarEventCallRecordingSelection => {
  let firstPendingSelection: ClassifiedCallRecording | undefined;
  let firstSelection: ClassifiedCallRecording | undefined;

  for (const callRecording of callRecordingsInArrivalOrder) {
    const selection = classifyCallRecording(callRecording);

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
