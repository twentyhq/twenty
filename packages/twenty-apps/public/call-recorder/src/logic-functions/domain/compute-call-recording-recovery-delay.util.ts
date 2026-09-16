import { createHash } from 'crypto';

import { CALL_RECORDING_RECOVERY_DISTRIBUTION_WINDOW_MS } from 'src/logic-functions/constants/call-recording-recovery-distribution-window-ms';

export const computeCallRecordingRecoveryDelay = (
  workspaceId: string,
): number =>
  createHash('sha256').update(workspaceId).digest().readUInt32BE(0) %
  CALL_RECORDING_RECOVERY_DISTRIBUTION_WINDOW_MS;
