import { describe, expect, it } from 'vitest';

import { isEmptyText } from 'src/logic-functions/utils/is-empty-text';

describe('isEmptyText', () => {
  it('is true for empty, whitespace and non-string values', () => {
    expect(isEmptyText('')).toBe(true);
    expect(isEmptyText('   ')).toBe(true);
    expect(isEmptyText(null)).toBe(true);
  });

  it('is false for a non-empty string', () => {
    expect(isEmptyText('hello')).toBe(false);
  });
});
