import { describe, expect, it } from 'vitest';

import { chunkIntoBatchesOrThrow } from 'src/utils/chunk-into-batches-or-throw.util';

describe('chunkIntoBatchesOrThrow', () => {
  it('keeps every item in order, including a partial last batch', () => {
    const items = ['first', 'second', 'third', 'fourth', 'fifth'];

    expect(chunkIntoBatchesOrThrow({ items, batchSize: 2 })).toEqual([
      ['first', 'second'],
      ['third', 'fourth'],
      ['fifth'],
    ]);
    expect(items).toEqual(['first', 'second', 'third', 'fourth', 'fifth']);
  });

  it('does not schedule an empty batch', () => {
    expect(chunkIntoBatchesOrThrow({ items: [], batchSize: 5 })).toEqual([]);
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid batch size %s',
    (batchSize) => {
      expect(() =>
        chunkIntoBatchesOrThrow({ items: ['note'], batchSize }),
      ).toThrow('Batch size must be a positive integer');
    },
  );
});
