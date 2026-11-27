import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export const LIVE_CALL_RECORDING_STATUSES = [
  CallRecordingStatus.JOINING,
  CallRecordingStatus.RECORDING,
] satisfies CallRecordingStatus[];
