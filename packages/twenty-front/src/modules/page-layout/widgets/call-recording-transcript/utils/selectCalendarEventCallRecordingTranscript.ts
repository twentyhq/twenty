import { type CalendarEventCallRecordingTranscriptCandidate } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptCandidate';
import { type CalendarEventCallRecordingTranscriptSelection } from '@/page-layout/widgets/call-recording-transcript/types/CalendarEventCallRecordingTranscriptSelection';
import { isArray, isNull, isUndefined } from '@sniptt/guards';
import {
  isCallRecordingTranscriptStatusMarker,
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

  if (!isUndefined(entries) && entries.length > 0) {
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

  if (
    !isNull(callRecording.transcript) &&
    !isUndefined(callRecording.transcript)
  ) {
    return { state: 'UNRECOGNIZED', callRecording };
  }

  return { state: 'MISSING', callRecording };
};

const parseTimestamp = (timestamp: string | null | undefined): number => {
  if (isNull(timestamp) || isUndefined(timestamp)) {
    return Number.NEGATIVE_INFINITY;
  }

  const parsedTimestamp = Date.parse(timestamp);

  return Number.isFinite(parsedTimestamp)
    ? parsedTimestamp
    : Number.NEGATIVE_INFINITY;
};

const getRecordingTimestamp = (
  callRecording: CalendarEventCallRecordingTranscriptCandidate,
): number => {
  const endedAtTimestamp = parseTimestamp(callRecording.endedAt);

  if (endedAtTimestamp !== Number.NEGATIVE_INFINITY) {
    return endedAtTimestamp;
  }

  const startedAtTimestamp = parseTimestamp(callRecording.startedAt);

  if (startedAtTimestamp !== Number.NEGATIVE_INFINITY) {
    return startedAtTimestamp;
  }

  return parseTimestamp(callRecording.createdAt);
};

const compareTimestampsDescending = (
  firstTimestamp: number,
  secondTimestamp: number,
): number => {
  if (firstTimestamp === secondTimestamp) {
    return 0;
  }

  return firstTimestamp > secondTimestamp ? -1 : 1;
};

const compareCallRecordingTranscriptRecency = (
  firstSelection: ClassifiedCallRecordingTranscript,
  secondSelection: ClassifiedCallRecordingTranscript,
): number => {
  const recordingTimestampComparison = compareTimestampsDescending(
    getRecordingTimestamp(firstSelection.callRecording),
    getRecordingTimestamp(secondSelection.callRecording),
  );

  if (recordingTimestampComparison !== 0) {
    return recordingTimestampComparison;
  }

  const createdAtTimestampComparison = compareTimestampsDescending(
    parseTimestamp(firstSelection.callRecording.createdAt),
    parseTimestamp(secondSelection.callRecording.createdAt),
  );

  if (createdAtTimestampComparison !== 0) {
    return createdAtTimestampComparison;
  }

  return firstSelection.callRecording.id.localeCompare(
    secondSelection.callRecording.id,
  );
};

const getNewestSelectionInStates = (
  selections: ClassifiedCallRecordingTranscript[],
  states: ClassifiedCallRecordingTranscript['state'][],
): ClassifiedCallRecordingTranscript | undefined =>
  selections
    .filter((selection) => states.includes(selection.state))
    .sort(compareCallRecordingTranscriptRecency)[0];

export const selectCalendarEventCallRecordingTranscript = (
  callRecordings: CalendarEventCallRecordingTranscriptCandidate[],
): CalendarEventCallRecordingTranscriptSelection => {
  if (callRecordings.length === 0) {
    return { state: 'NO_RECORDING' };
  }

  const selections = callRecordings.map(classifyCallRecordingTranscript);

  const newestReadySelection = getNewestSelectionInStates(selections, [
    'READY',
  ]);

  if (!isUndefined(newestReadySelection)) {
    return newestReadySelection;
  }

  const newestPendingSelection = getNewestSelectionInStates(selections, [
    'PENDING',
  ]);

  if (!isUndefined(newestPendingSelection)) {
    return newestPendingSelection;
  }

  return (
    getNewestSelectionInStates(selections, [
      'FAILED',
      'EMPTY',
      'MISSING',
      'UNRECOGNIZED',
    ]) ?? { state: 'NO_RECORDING' }
  );
};
