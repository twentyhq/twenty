import { describe, expect, it } from 'vitest';

import { isDefined } from 'src/utils/is-defined';

describe('isDefined', () => {
  it('is true for defined values, including falsy ones', () => {
    expect(isDefined(0)).toBe(true);
    expect(isDefined('')).toBe(true);
    expect(isDefined(false)).toBe(true);
  });

  it('is false for null and undefined', () => {
    expect(isDefined(null)).toBe(false);
    expect(isDefined(undefined)).toBe(false);
  });
});
