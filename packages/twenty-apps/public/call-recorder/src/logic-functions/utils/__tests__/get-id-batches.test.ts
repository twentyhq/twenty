import { describe, expect, it } from 'vitest';

import { getIdBatches } from 'src/logic-functions/utils/get-id-batches.util';

describe('getIdBatches', () => {
  it('returns no batches for an empty list', () => {
    expect(getIdBatches([], 3)).toEqual([]);
  });

  it('splits ids into batches of the given size with a shorter tail', () => {
    expect(getIdBatches(['a', 'b', 'c', 'd', 'e'], 2)).toEqual([
      ['a', 'b'],
      ['c', 'd'],
      ['e'],
    ]);
  });

  it('keeps a list at or under the batch size as a single batch', () => {
    expect(getIdBatches(['a', 'b'], 2)).toEqual([['a', 'b']]);
  });
});
