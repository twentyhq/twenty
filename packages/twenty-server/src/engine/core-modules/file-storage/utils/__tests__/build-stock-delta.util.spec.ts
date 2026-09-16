import { buildStockDelta } from 'src/engine/core-modules/file-storage/utils/build-stock-delta.util';

const existingFile = (size: number) => ({ size });

describe('buildStockDelta', () => {
  it('charges the bytes and the row of a file at a free path', () => {
    expect(buildStockDelta({ existingFile: null, size: 12 })).toEqual({
      bytes: 12,
      quantity: 1,
    });
  });

  it('charges the row of an empty file, which still occupies one', () => {
    expect(buildStockDelta({ existingFile: null, size: 0 })).toEqual({
      bytes: 0,
      quantity: 1,
    });
  });

  it('moves nothing when a replacement is the same size', () => {
    expect(
      buildStockDelta({ existingFile: existingFile(500), size: 500 }),
    ).toEqual({ bytes: 0, quantity: 0 });
  });

  it('charges a growing replacement only for what it adds', () => {
    expect(buildStockDelta({ existingFile: existingFile(1), size: 2 })).toEqual(
      { bytes: 1, quantity: 0 },
    );
  });

  it('gives back what a shrinking replacement frees', () => {
    expect(
      buildStockDelta({ existingFile: existingFile(500), size: 2 }),
    ).toEqual({ bytes: -498, quantity: 0 });
  });
});
