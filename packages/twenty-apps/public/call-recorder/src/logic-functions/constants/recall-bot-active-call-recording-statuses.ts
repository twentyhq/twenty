import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

export const RECALL_BOT_ACTIVE_CALL_RECORDING_STATUSES = [
  CallRecordingStatus.SCHEDULED,
  CallRecordingStatus.JOINING,
  CallRecordingStatus.RECORDING,
] satisfies CallRecordingStatus[];
