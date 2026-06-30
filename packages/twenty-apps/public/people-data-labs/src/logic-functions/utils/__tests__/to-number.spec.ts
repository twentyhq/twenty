import { describe, expect, it } from 'vitest';

import { toNumber } from 'src/logic-functions/utils/to-number';

describe('toNumber', () => {
  it('returns finite numbers including zero', () => {
    expect(toNumber(0)).toBe(0);
    expect(toNumber(120)).toBe(120);
  });

  it('returns undefined for non-finite numbers and non-numbers', () => {
    expect(toNumber(Number.NaN)).toBeUndefined();
    expect(toNumber(Number.POSITIVE_INFINITY)).toBeUndefined();
    expect(toNumber('120')).toBeUndefined();
    expect(toNumber(null)).toBeUndefined();
  });
});
