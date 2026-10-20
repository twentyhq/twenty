import { computePendingWakeUpRetryDelayMs } from 'src/engine/core-modules/pending-wake-up/utils/compute-pending-wake-up-retry-delay-ms.util';

describe('computePendingWakeUpRetryDelayMs', () => {
  it('doubles the delay with each attempt', () => {
    expect([0, 1, 2, 3, 4].map(computePendingWakeUpRetryDelayMs)).toEqual([
      2_000, 4_000, 8_000, 16_000, 32_000,
    ]);
  });

  it('caps the delay however many attempts were made', () => {
    expect(computePendingWakeUpRetryDelayMs(5)).toBe(60_000);
    expect(computePendingWakeUpRetryDelayMs(5_000)).toBe(60_000);
  });
});
