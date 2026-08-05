import { describe, expect, it } from 'vitest';

import { toText } from 'src/logic-functions/utils/to-text';

describe('toText', () => {
  it('trims and returns a non-empty string', () => {
    expect(toText('  hello  ')).toBe('hello');
  });

  it('returns undefined for an empty or whitespace string', () => {
    expect(toText('')).toBeUndefined();
    expect(toText('   ')).toBeUndefined();
  });

  it('returns undefined for non-string values', () => {
    expect(toText(42)).toBeUndefined();
    expect(toText(null)).toBeUndefined();
    expect(toText(undefined)).toBeUndefined();
  });
});
