import { describe, expect, it } from 'vitest';

import { getNormalizedHexValue } from 'src/front-components/utils/get-normalized-hex-value.util';

describe('getNormalizedHexValue', () => {
  it('normalizes valid hex values', () => {
    expect(getNormalizedHexValue('#1D1D1D')).toBe('#1d1d1d');
    expect(getNormalizedHexValue(' #abc ')).toBe('#aabbcc');
  });

  it('keeps an empty value so the variable can be cleared', () => {
    expect(getNormalizedHexValue('')).toBe('');
    expect(getNormalizedHexValue('   ')).toBe('');
  });

  it('returns undefined for values that are not hex colours', () => {
    expect(getNormalizedHexValue('#12')).toBeUndefined();
    expect(getNormalizedHexValue('1d1d1d')).toBeUndefined();
    expect(getNormalizedHexValue('red')).toBeUndefined();
  });
});
