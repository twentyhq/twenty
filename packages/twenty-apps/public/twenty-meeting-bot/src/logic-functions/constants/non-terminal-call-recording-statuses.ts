import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export const NON_TERMINAL_CALL_RECORDING_STATUSES = [
  CallRecordingStatus.SCHEDULED,
  CallRecordingStatus.JOINING,
  CallRecordingStatus.RECORDING,
  CallRecordingStatus.PROCESSING,
] satisfies CallRecordingStatus[];
