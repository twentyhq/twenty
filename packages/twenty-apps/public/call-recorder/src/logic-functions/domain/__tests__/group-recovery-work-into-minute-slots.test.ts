import { describe, expect, it } from 'vitest';

import { RECALL_RECOVERY_CALLS_PER_MINUTE } from 'src/logic-functions/constants/recall-recovery-calls-per-minute';
import {
  type CallRecordingRecoveryWork,
  groupRecoveryWorkIntoMinuteSlots,
} from 'src/logic-functions/domain/group-recovery-work-into-minute-slots.util';

const buildWork = (
  count: number,
  kind: CallRecordingRecoveryWork['kind'],
  prefix: string = kind,
): CallRecordingRecoveryWork[] =>
  Array.from({ length: count }, (_, index) => ({
    callRecordingId: `${prefix}-${index}`,
    kind,
  }));

describe('groupRecoveryWorkIntoMinuteSlots', () => {
  it('returns no slots when there is no work', () => {
    expect(groupRecoveryWorkIntoMinuteSlots([])).toEqual([]);
  });

  it('fits one reconciliation per Recall call in each minute', () => {
    const slots = groupRecoveryWorkIntoMinuteSlots(
      buildWork(RECALL_RECOVERY_CALLS_PER_MINUTE * 2 + 1, 'reconcile'),
    );

    expect(slots.map((slot) => slot.length)).toEqual([
      RECALL_RECOVERY_CALLS_PER_MINUTE,
      RECALL_RECOVERY_CALLS_PER_MINUTE,
      1,
    ]);
  });

  it('counts an import as one Recall call per artifact scope', () => {
    const slots = groupRecoveryWorkIntoMinuteSlots(buildWork(25, 'import'));

    expect(slots.map((slot) => slot.length)).toEqual([20, 5]);
  });

  it('moves work that would overflow a minute into the next one, keeping order', () => {
    const recoveryWork = [
      ...buildWork(58, 'reconcile'),
      ...buildWork(1, 'import'),
      ...buildWork(1, 'reconcile', 'late'),
    ];
    const slots = groupRecoveryWorkIntoMinuteSlots(recoveryWork);

    expect(slots.map((slot) => slot.length)).toEqual([58, 2]);
    expect(slots.flat()).toEqual(recoveryWork);
  });
});
