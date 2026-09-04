import { describe, expect, it } from 'vitest';

import { getNormalizedNumberValue } from 'src/front-components/utils/get-normalized-number-value.util';

describe('getNormalizedNumberValue', () => {
  it('normalizes numeric values', () => {
    expect(getNormalizedNumberValue('0')).toBe('0');
    expect(getNormalizedNumberValue(' 7 ')).toBe('7');
    expect(getNormalizedNumberValue('-1.50')).toBe('-1.5');
  });

  it('keeps an empty value so a variable can be cleared', () => {
    expect(getNormalizedNumberValue('')).toBe('');
    expect(getNormalizedNumberValue('   ')).toBe('');
  });

  it('returns undefined for values that are not numbers', () => {
    expect(getNormalizedNumberValue('abc')).toBeUndefined();
    expect(getNormalizedNumberValue('12abc')).toBeUndefined();
    expect(getNormalizedNumberValue('Infinity')).toBeUndefined();
  });
});
