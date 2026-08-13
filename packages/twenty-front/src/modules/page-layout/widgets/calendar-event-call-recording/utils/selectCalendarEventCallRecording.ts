import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { isCallRecordingInProgress } from '@/page-layout/widgets/calendar-event-call-recording/utils/isCallRecordingInProgress';
import { CallRecordingStatus } from '~/generated/graphql';

export const selectCalendarEventCallRecording = (
  callRecordingsInArrivalOrder: CalendarEventCallRecordingCandidate[],
): CalendarEventCallRecordingCandidate | undefined =>
  callRecordingsInArrivalOrder.find(
    (callRecording) => callRecording.status === CallRecordingStatus.COMPLETED,
  ) ??
  callRecordingsInArrivalOrder.find(isCallRecordingInProgress) ??
  callRecordingsInArrivalOrder[0];
