import { CallRecordingStatus } from 'src/logic-functions/constants/CallRecordingStatus';

export const NON_TERMINAL_CALL_RECORDING_STATUSES = [
  CallRecordingStatus.SCHEDULED,
  CallRecordingStatus.JOINING,
  CallRecordingStatus.RECORDING,
  CallRecordingStatus.PROCESSING,
] satisfies CallRecordingStatus[];
