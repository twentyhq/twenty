import { buildStockDelta } from 'src/engine/core-modules/file-storage/utils/build-stock-delta.util';

const existingFile = (size: number) => ({ size });

describe('buildStockDelta', () => {
  it('moves nothing when a replacement is the same size', () => {
    expect(
      buildStockDelta({ existingFile: existingFile(500), size: 500 }),
    ).toEqual({ bytes: 0, quantity: 0 });
  });
});
