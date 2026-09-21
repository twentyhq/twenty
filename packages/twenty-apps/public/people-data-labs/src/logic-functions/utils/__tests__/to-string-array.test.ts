import { describe, expect, it } from 'vitest';

import { toStringArray } from 'src/logic-functions/utils/to-string-array';

describe('toStringArray', () => {
  it('cleans, trims and dedupes string entries', () => {
    expect(toStringArray([' a ', 'b', 'a', '', 3, null])).toEqual(['a', 'b']);
  });

  it('returns undefined for a non-array', () => {
    expect(toStringArray('a')).toBeUndefined();
  });

  it('returns undefined when nothing usable remains', () => {
    expect(toStringArray(['', '   ', null])).toBeUndefined();
  });
});
