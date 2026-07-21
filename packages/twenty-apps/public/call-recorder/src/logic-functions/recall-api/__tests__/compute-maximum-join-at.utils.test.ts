import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { computeMaximumJoinAt } from 'src/logic-functions/recall-api/compute-maximum-join-at.utils';

const NOW = new Date('2026-07-17T10:00:00.000Z');

describe('computeMaximumJoinAt', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns joinAt when it is later than now plus one second', () => {
    const joinAt = '2026-07-17T10:00:10.000Z';

    const result = computeMaximumJoinAt(joinAt);

    expect(result).toBe(joinAt);
  });

  it('returns now plus one second when joinAt is in the past', () => {
    const joinAt = '2026-07-17T09:59:00.000Z';

    const result = computeMaximumJoinAt(joinAt);

    expect(result).toBe('2026-07-17T10:00:01.000Z');
  });

  it('returns now plus one second when joinAt is equal to now', () => {
    const joinAt = '2026-07-17T10:00:00.000Z';

    const result = computeMaximumJoinAt(joinAt);

    expect(result).toBe('2026-07-17T10:00:01.000Z');
  });

  it('returns joinAt when it is equal to now plus one second', () => {
    const joinAt = '2026-07-17T10:00:01.000Z';

    const result = computeMaximumJoinAt(joinAt);

    expect(result).toBe('2026-07-17T10:00:01.000Z');
  });

  it('normalizes an ISO 8601 value with a timezone offset to UTC', () => {
    const joinAt = '2026-07-17T12:00:10.000+02:00';

    const result = computeMaximumJoinAt(joinAt);

    expect(result).toBe('2026-07-17T10:00:10.000Z');
  });

  it('throws when joinAt is not a valid date', () => {
    expect(() => computeMaximumJoinAt('not-a-date')).toThrow(RangeError);
  });
});
