import { buildStockDelta } from 'src/engine/core-modules/file-storage/utils/build-stock-delta.util';

const existingFile = (size: number) => ({ size });

describe('buildStockDelta', () => {
  it('charges a new file for everything it holds', () => {
    expect(buildStockDelta({ existingFile: null, size: 800 })).toEqual({
      bytes: 800,
      quantity: 1,
    });
  });

  it('charges an empty new file for the row it holds', () => {
    expect(buildStockDelta({ existingFile: null, size: 0 })).toEqual({
      bytes: 0,
      quantity: 1,
    });
  });

  it('charges a replacement only for what it adds', () => {
    expect(
      buildStockDelta({ existingFile: existingFile(500), size: 800 }),
    ).toEqual({ bytes: 300, quantity: 0 });
  });

  it('gives back what a shrinking replacement frees', () => {
    expect(
      buildStockDelta({ existingFile: existingFile(800), size: 500 }),
    ).toEqual({ bytes: -300, quantity: 0 });
  });

  it('moves nothing when a replacement is the same size', () => {
    expect(
      buildStockDelta({ existingFile: existingFile(500), size: 500 }),
    ).toEqual({ bytes: 0, quantity: 0 });
  });
});
