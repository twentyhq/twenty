import { describe, expect, it } from 'vitest';

import { toJsonArray } from 'src/logic-functions/utils/to-json-array';

describe('toJsonArray', () => {
  it('returns a non-empty array unchanged', () => {
    const value = [{ a: 1 }];

    expect(toJsonArray(value)).toBe(value);
  });

  it('returns undefined for empty arrays and non-arrays', () => {
    expect(toJsonArray([])).toBeUndefined();
    expect(toJsonArray({ a: 1 })).toBeUndefined();
  });
});
