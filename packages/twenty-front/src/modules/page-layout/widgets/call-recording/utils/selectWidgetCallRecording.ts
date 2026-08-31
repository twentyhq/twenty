import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { isCallRecordingInProgress } from '@/page-layout/widgets/call-recording/utils/isCallRecordingInProgress';
import { CallRecordingStatus } from '~/generated/graphql';

export const selectWidgetCallRecording = (
  callRecordingsInArrivalOrder: WidgetCallRecordingCandidate[],
): WidgetCallRecordingCandidate | undefined =>
  callRecordingsInArrivalOrder.find(
    (callRecording) => callRecording.status === CallRecordingStatus.COMPLETED,
  ) ??
  callRecordingsInArrivalOrder.find(isCallRecordingInProgress) ??
  callRecordingsInArrivalOrder[0];
