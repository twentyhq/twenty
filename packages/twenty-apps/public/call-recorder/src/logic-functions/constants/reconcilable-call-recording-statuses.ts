import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';

export const RECONCILABLE_CALL_RECORDING_STATUSES: readonly string[] = [
  ...NON_TERMINAL_CALL_RECORDING_STATUSES,
  CallRecordingStatus.COMPLETED,
];
