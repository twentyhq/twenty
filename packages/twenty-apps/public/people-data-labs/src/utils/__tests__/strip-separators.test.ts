import { describe, expect, it } from 'vitest';

import { stripSeparators } from 'src/utils/strip-separators';

describe('stripSeparators', () => {
  it('removes spaces and commas', () => {
    expect(stripSeparators('45,000 - 55,000')).toBe('45000-55000');
  });

  it('leaves a value without separators unchanged', () => {
    expect(stripSeparators('1-10')).toBe('1-10');
  });
});
