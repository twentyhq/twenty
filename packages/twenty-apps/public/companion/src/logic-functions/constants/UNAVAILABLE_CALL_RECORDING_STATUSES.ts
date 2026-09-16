import { CallRecordingStatus } from 'src/logic-functions/constants/CallRecordingStatus';

export const UNAVAILABLE_CALL_RECORDING_STATUSES: readonly string[] = [
  CallRecordingStatus.FAILED,
  CallRecordingStatus.NOT_RECORDED,
];
