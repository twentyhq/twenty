import { describe, expect, it } from 'vitest';

import { getRandomDelayMilliseconds } from 'src/logic-functions/utils/get-random-delay-milliseconds.util';

describe('getRandomDelayMilliseconds', () => {
  it('should return a whole number of milliseconds below the maximum', () => {
    const delays = Array.from({ length: 100 }, () =>
      getRandomDelayMilliseconds(1_000),
    );

    expect(delays.every(Number.isInteger)).toBe(true);
    expect(Math.min(...delays)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...delays)).toBeLessThan(1_000);
  });
});
