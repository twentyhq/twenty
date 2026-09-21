import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export const UNAVAILABLE_CALL_RECORDING_STATUSES: readonly string[] = [
  CallRecordingStatus.FAILED,
  CallRecordingStatus.NOT_RECORDED,
];
