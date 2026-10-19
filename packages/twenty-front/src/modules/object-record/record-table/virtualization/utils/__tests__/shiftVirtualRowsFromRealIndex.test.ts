import { shiftVirtualRowsFromRealIndex } from '@/object-record/record-table/virtualization/utils/shiftVirtualRowsFromRealIndex';

const virtualRows = () => {
  const allRecordIds: string[] = [];

  allRecordIds[10] = 'a';
  allRecordIds[11] = 'b';
  allRecordIds[12] = 'c';

  return {
    recordIdByRealIndex: new Map([
      [10, 'a'],
      [11, 'b'],
      [12, 'c'],
    ]),
    dataLoadingStatusByRealIndex: new Map<number, 'loaded' | 'not-loaded'>([
      [10, 'loaded'],
      [11, 'loaded'],
      [12, 'loaded'],
    ]),
    allRecordIds,
  };
};

describe('shiftVirtualRowsFromRealIndex', () => {
  it('moves the rows at or after the index down by one on insert', () => {
    const shifted = shiftVirtualRowsFromRealIndex({
      ...virtualRows(),
      fromRealIndex: 11,
      shift: 1,
    });

    expect([...shifted.recordIdByRealIndex]).toEqual([
      [10, 'a'],
      [12, 'b'],
      [13, 'c'],
    ]);
    expect(shifted.dataLoadingStatusByRealIndex.has(11)).toBe(false);
    expect(shifted.allRecordIds[12]).toBe('b');
    expect(shifted.allRecordIds[11]).toBeUndefined();
  });

  it('drops the removed row and moves the following rows up by one', () => {
    const shifted = shiftVirtualRowsFromRealIndex({
      ...virtualRows(),
      fromRealIndex: 12,
      shift: -1,
      realIndexToDrop: 11,
    });

    expect([...shifted.recordIdByRealIndex]).toEqual([
      [10, 'a'],
      [11, 'c'],
    ]);
    expect([...shifted.dataLoadingStatusByRealIndex.keys()]).toEqual([10, 11]);
    expect(shifted.allRecordIds[11]).toBe('c');
    expect(shifted.allRecordIds.length).toBe(12);
  });
});
