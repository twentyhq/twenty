import { isUndefined } from '@sniptt/guards';

import { type CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';

export const isNonTerminalCallRecordingStatus = (
  status: string | undefined,
): status is CallRecordingStatus =>
  !isUndefined(status) &&
  NON_TERMINAL_CALL_RECORDING_STATUSES.some(
    (nonTerminalStatus) => nonTerminalStatus === status,
  );
