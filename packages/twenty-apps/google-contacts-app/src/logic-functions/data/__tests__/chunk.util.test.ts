import { describe, expect, it } from 'vitest';

import { chunk } from 'src/logic-functions/data/chunk.util';

describe('chunk', () => {
  it('should split items into batches of the given size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('should keep items in one batch when they all fit', () => {
    expect(chunk([1, 2], 200)).toEqual([[1, 2]]);
  });

  it('should return no batch for no item', () => {
    expect(chunk([], 200)).toEqual([]);
  });
});
