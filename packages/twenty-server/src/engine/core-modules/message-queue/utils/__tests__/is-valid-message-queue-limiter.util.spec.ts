import { isValidMessageQueueLimiter } from 'src/engine/core-modules/message-queue/utils/is-valid-message-queue-limiter.util';

describe('isValidMessageQueueLimiter', () => {
  it.each([
    { max: 1, durationMs: 1_000 },
    { max: 100, durationMs: 60_000 },
    { max: 3, durationMs: 0.5 },
  ])('accepts $max per $durationMs ms', (limiter) => {
    expect(isValidMessageQueueLimiter(limiter)).toBe(true);
  });

  it.each([
    { max: 0, durationMs: 1_000 },
    { max: -1, durationMs: 1_000 },
    { max: 1.5, durationMs: 1_000 },
    { max: Number.NaN, durationMs: 1_000 },
    { max: Number.POSITIVE_INFINITY, durationMs: 1_000 },
    { max: 1, durationMs: 0 },
    { max: 1, durationMs: -1_000 },
    { max: 1, durationMs: Number.NaN },
    { max: 1, durationMs: Number.POSITIVE_INFINITY },
  ])('refuses $max per $durationMs ms', (limiter) => {
    expect(isValidMessageQueueLimiter(limiter)).toBe(false);
  });
});
