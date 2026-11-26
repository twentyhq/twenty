import { describe, expect, it } from 'vitest';

import { chunkIntoBatches } from 'src/logic-functions/utils/chunk-into-batches.util';

describe('chunkIntoBatches', () => {
  it('should split items into batches of the given size', () => {
    expect(chunkIntoBatches({ items: [1, 2, 3, 4, 5], batchSize: 2 })).toEqual([
      [1, 2],
      [3, 4],
      [5],
    ]);
  });

  it('should give no batch for no item', () => {
    expect(chunkIntoBatches({ items: [], batchSize: 2 })).toEqual([]);
  });
});
