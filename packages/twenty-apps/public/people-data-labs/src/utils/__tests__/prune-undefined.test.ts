import { describe, expect, it } from 'vitest';

import { pruneUndefined } from 'src/utils/prune-undefined';

describe('pruneUndefined', () => {
  it('removes keys whose value is undefined', () => {
    expect(pruneUndefined({ a: 1, b: undefined, c: 3 })).toEqual({ a: 1, c: 3 });
  });

  it('keeps falsy values that are not undefined', () => {
    expect(pruneUndefined({ a: 0, b: '', c: null, d: false })).toEqual({
      a: 0,
      b: '',
      c: null,
      d: false,
    });
  });

  it('returns an empty object when every value is undefined', () => {
    expect(pruneUndefined({ a: undefined, b: undefined })).toEqual({});
  });
});
