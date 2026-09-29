import { describe, expect, it } from 'vitest';

import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { RECALL_RECOVERY_CALLS_PER_MINUTE } from 'src/logic-functions/constants/recall-recovery-calls-per-minute';
import { groupPendingCallRecordingRecoveriesIntoMinuteSlots } from 'src/logic-functions/domain/group-pending-call-recording-recoveries-into-minute-slots.util';

const buildCallRecordingIds = (count: number): string[] =>
  Array.from({ length: count }, (_, index) => `call-recording-${index}`);

describe('groupPendingCallRecordingRecoveriesIntoMinuteSlots', () => {
  it('returns no slots when nothing is pending', () => {
    expect(groupPendingCallRecordingRecoveriesIntoMinuteSlots([])).toEqual([]);
  });

  it('starts each full minute of recoveries one minute after the previous one', () => {
    const minuteSlots = groupPendingCallRecordingRecoveriesIntoMinuteSlots(
      buildCallRecordingIds(RECALL_RECOVERY_CALLS_PER_MINUTE * 2 + 1),
    );

    expect(
      minuteSlots.map(({ delayMs, callRecordingIds }) => ({
        delayMs,
        recoveryCount: callRecordingIds.length,
      })),
    ).toEqual([
      { delayMs: 0, recoveryCount: RECALL_RECOVERY_CALLS_PER_MINUTE },
      {
        delayMs: MILLISECONDS_PER_MINUTE,
        recoveryCount: RECALL_RECOVERY_CALLS_PER_MINUTE,
      },
      { delayMs: 2 * MILLISECONDS_PER_MINUTE, recoveryCount: 1 },
    ]);
  });

  it('keeps every recording once, in order', () => {
    const callRecordingIds = buildCallRecordingIds(
      RECALL_RECOVERY_CALLS_PER_MINUTE + 5,
    );

    expect(
      groupPendingCallRecordingRecoveriesIntoMinuteSlots(
        callRecordingIds,
      ).flatMap((minuteSlot) => minuteSlot.callRecordingIds),
    ).toEqual(callRecordingIds);
  });
});
