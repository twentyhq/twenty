import { describe, expect, it } from 'vitest';

import { toJsonObject } from 'src/logic-functions/utils/to-json-object';

describe('toJsonObject', () => {
  it('returns a non-empty plain object unchanged', () => {
    const value = { country: { us: 10 } };

    expect(toJsonObject(value)).toBe(value);
  });

  it('returns undefined for empty objects, arrays and non-objects', () => {
    expect(toJsonObject({})).toBeUndefined();
    expect(toJsonObject([1, 2])).toBeUndefined();
    expect(toJsonObject('x')).toBeUndefined();
    expect(toJsonObject(null)).toBeUndefined();
  });
});
