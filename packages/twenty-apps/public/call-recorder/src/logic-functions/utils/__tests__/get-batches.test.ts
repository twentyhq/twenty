import { describe, expect, it } from 'vitest';

import { getBatches } from 'src/logic-functions/utils/get-batches.util';

describe('getBatches', () => {
  it('returns no batches for an empty list', () => {
    expect(getBatches([], 3)).toEqual([]);
  });

  it('splits items into batches of the given size with a shorter tail', () => {
    expect(getBatches(['a', 'b', 'c', 'd', 'e'], 2)).toEqual([
      ['a', 'b'],
      ['c', 'd'],
      ['e'],
    ]);
  });

  it('keeps a list at or under the batch size as a single batch', () => {
    expect(getBatches(['a', 'b'], 2)).toEqual([['a', 'b']]);
  });
});
