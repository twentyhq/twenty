import { buildStockDelta } from 'src/engine/core-modules/file-storage/utils/build-stock-delta.util';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const existingFile = (size: number) => ({ size });

describe('buildStockDelta', () => {
  it('charges the bytes and the file of a file at a free path', () => {
    expect(buildStockDelta({ existingFile: null, size: 12 })).toEqual({
      [UsageUnit.BYTE]: 12,
      [UsageUnit.FILE]: 1,
    });
  });

  it('charges the file of an empty file, which still occupies one', () => {
    expect(buildStockDelta({ existingFile: null, size: 0 })).toEqual({
      [UsageUnit.BYTE]: 0,
      [UsageUnit.FILE]: 1,
    });
  });

  it('moves nothing when a replacement is the same size', () => {
    expect(
      buildStockDelta({ existingFile: existingFile(500), size: 500 }),
    ).toEqual({ [UsageUnit.BYTE]: 0, [UsageUnit.FILE]: 0 });
  });

  it('charges a growing replacement only for what it adds', () => {
    expect(buildStockDelta({ existingFile: existingFile(1), size: 2 })).toEqual(
      { [UsageUnit.BYTE]: 1, [UsageUnit.FILE]: 0 },
    );
  });

  it('gives back what a shrinking replacement frees', () => {
    expect(
      buildStockDelta({ existingFile: existingFile(500), size: 2 }),
    ).toEqual({ [UsageUnit.BYTE]: -498, [UsageUnit.FILE]: 0 });
  });
});
