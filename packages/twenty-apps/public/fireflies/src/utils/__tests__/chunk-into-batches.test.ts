import { describe, expect, it } from 'vitest';

import { chunkIntoBatches } from 'src/utils/chunk-into-batches.util';

describe('chunkIntoBatches', () => {
  it('splits items into batches of the requested size', () => {
    expect(chunkIntoBatches(['a', 'b', 'c', 'd', 'e'], 2)).toEqual([
      ['a', 'b'],
      ['c', 'd'],
      ['e'],
    ]);
  });

  it('returns no batches for an empty list', () => {
    expect(chunkIntoBatches([], 2)).toEqual([]);
  });

  it('returns a single batch when the list fits the batch size', () => {
    expect(chunkIntoBatches(['a', 'b'], 20)).toEqual([['a', 'b']]);
  });
});
