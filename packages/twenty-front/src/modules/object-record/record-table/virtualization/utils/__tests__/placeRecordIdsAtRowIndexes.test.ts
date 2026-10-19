import { placeRecordIdsAtRowIndexes } from '@/object-record/record-table/virtualization/utils/placeRecordIdsAtRowIndexes';

describe('placeRecordIdsAtRowIndexes', () => {
  it('writes the records from the starting row index and clears their previous index', () => {
    const recordIdsByRowIndex: string[] = [];

    recordIdsByRowIndex[0] = 'a';
    recordIdsByRowIndex[1] = 'b';
    recordIdsByRowIndex[5] = 'c';

    const nextRecordIdsByRowIndex = placeRecordIdsAtRowIndexes({
      recordIdsByRowIndex,
      recordIds: ['c', 'd'],
      startingRowIndex: 1,
    });

    expect(nextRecordIdsByRowIndex[0]).toBe('a');
    expect(nextRecordIdsByRowIndex[1]).toBe('c');
    expect(nextRecordIdsByRowIndex[2]).toBe('d');
    expect(5 in nextRecordIdsByRowIndex).toBe(false);
  });
});
