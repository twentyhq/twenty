import { describe, expect, it } from 'vitest';

import { CALL_RECORDING_RECOVERY_DISTRIBUTION_WINDOW_MS } from 'src/logic-functions/constants/call-recording-recovery-distribution-window-ms';
import { computeCallRecordingRecoveryDelay } from 'src/logic-functions/domain/compute-call-recording-recovery-delay.util';

describe('computeCallRecordingRecoveryDelay', () => {
  it('returns the same delay for the same workspace', () => {
    const workspaceId = '20202020-1111-4444-8888-303030303030';

    expect(computeCallRecordingRecoveryDelay(workspaceId)).toBe(
      computeCallRecordingRecoveryDelay(workspaceId),
    );
  });

  it('stays inside the distribution window', () => {
    const delayMs = computeCallRecordingRecoveryDelay(
      '20202020-2222-4444-8888-303030303030',
    );

    expect(delayMs).toBeGreaterThanOrEqual(0);
    expect(delayMs).toBeLessThan(
      CALL_RECORDING_RECOVERY_DISTRIBUTION_WINDOW_MS,
    );
  });
});
