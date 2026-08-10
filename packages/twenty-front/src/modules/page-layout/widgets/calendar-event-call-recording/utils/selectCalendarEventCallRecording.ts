import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { type CalendarEventCallRecordingSelection } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingSelection';
import { isCallRecordingTranscriptPending } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingTranscriptPending';
import {
  isDefined,
  isNonEmptyArray,
  parseCallRecordingTranscriptEntries,
} from 'twenty-shared/utils';

export const selectCalendarEventCallRecording = (
  callRecordingsInArrivalOrder: CalendarEventCallRecordingCandidate[],
): CalendarEventCallRecordingSelection | undefined => {
  for (const callRecording of callRecordingsInArrivalOrder) {
    const transcriptEntries = parseCallRecordingTranscriptEntries(
      callRecording.transcript,
    );

    if (isNonEmptyArray(transcriptEntries)) {
      return { callRecording, transcriptEntries };
    }
  }

  const selectedCallRecording =
    callRecordingsInArrivalOrder.find(isCallRecordingTranscriptPending) ??
    callRecordingsInArrivalOrder[0];

  if (!isDefined(selectedCallRecording)) {
    return undefined;
  }

  return { callRecording: selectedCallRecording, transcriptEntries: undefined };
};
