import { describe, expect, it } from 'vitest';

import { chunk } from 'src/logic-functions/utils/chunk';

describe('chunk', () => {
  it('splits an array into chunks of the given size', () => {
    expect(chunk({ items: [1, 2, 3, 4, 5], size: 2 })).toEqual([
      [1, 2],
      [3, 4],
      [5],
    ]);
  });

  it('returns a single chunk when the array is smaller than the size', () => {
    expect(chunk({ items: [1, 2], size: 10 })).toEqual([[1, 2]]);
  });

  it('returns an empty array for empty input', () => {
    expect(chunk({ items: [], size: 10 })).toEqual([]);
  });

  it('returns the whole array as one chunk for a non-positive size', () => {
    expect(chunk({ items: [1, 2, 3], size: 0 })).toEqual([[1, 2, 3]]);
  });
});
