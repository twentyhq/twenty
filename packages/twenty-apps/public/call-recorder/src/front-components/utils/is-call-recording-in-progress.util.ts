import { type CallRecordingNode } from 'src/front-components/types/call-recording-node.type';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';

export const isCallRecordingInProgress = (
  callRecording: Pick<CallRecordingNode, 'status'>,
) =>
  NON_TERMINAL_CALL_RECORDING_STATUSES.some(
    (status) => status === callRecording.status,
  );
