import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { CallRecordingStatus } from '~/generated/graphql';

const IN_PROGRESS_CALL_RECORDING_STATUSES = new Set<CallRecordingStatus>([
  CallRecordingStatus.SCHEDULED,
  CallRecordingStatus.JOINING,
  CallRecordingStatus.RECORDING,
  CallRecordingStatus.PROCESSING,
]);

export const isCallRecordingInProgress = (
  callRecording: WidgetCallRecordingCandidate,
): boolean => IN_PROGRESS_CALL_RECORDING_STATUSES.has(callRecording.status);
