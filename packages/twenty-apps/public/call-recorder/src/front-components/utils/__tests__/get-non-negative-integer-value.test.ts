import { describe, expect, it } from 'vitest';

import { getNonNegativeIntegerValue } from 'src/front-components/utils/get-non-negative-integer-value.util';

describe('getNonNegativeIntegerValue', () => {
  it('parses a stored integer', () => {
    expect(getNonNegativeIntegerValue(' 30 ')).toBe(30);
    expect(getNonNegativeIntegerValue('0')).toBe(0);
  });

  it('returns null for an empty value, so the server default applies', () => {
    expect(getNonNegativeIntegerValue('')).toBeNull();
    expect(getNonNegativeIntegerValue('   ')).toBeNull();
  });

  it('returns null for values the server would reject', () => {
    expect(getNonNegativeIntegerValue('-1')).toBeNull();
    expect(getNonNegativeIntegerValue('1.5')).toBeNull();
    expect(getNonNegativeIntegerValue('abc')).toBeNull();
  });
});
