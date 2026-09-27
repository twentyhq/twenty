import { getPagePositionsSkipping } from 'src/engine/core-modules/record-import/utils/get-page-positions-skipping.util';

describe('getPagePositionsSkipping', () => {
  it('pages through positions as if skipped ones did not exist', () => {
    const skippedPositions = [0, 3, 4];

    expect(
      getPagePositionsSkipping({ offset: 0, pageSize: 3, skippedPositions }),
    ).toEqual([1, 2, 5]);
    expect(
      getPagePositionsSkipping({ offset: 3, pageSize: 2, skippedPositions }),
    ).toEqual([6, 7]);
  });

  it('returns consecutive positions when nothing is skipped', () => {
    expect(
      getPagePositionsSkipping({
        offset: 10,
        pageSize: 2,
        skippedPositions: [],
      }),
    ).toEqual([10, 11]);
  });
});
