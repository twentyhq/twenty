import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export const isRecallBotRemovalCallRecordingStatus = (
  status: string | undefined,
): status is CallRecordingStatus =>
  [
    CallRecordingStatus.SCHEDULED,
    CallRecordingStatus.JOINING,
    CallRecordingStatus.RECORDING,
    CallRecordingStatus.FAILED,
  ].some((removalStatus) => removalStatus === status);
