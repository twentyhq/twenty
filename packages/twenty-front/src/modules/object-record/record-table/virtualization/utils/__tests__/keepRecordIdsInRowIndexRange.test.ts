import { keepRecordIdsInRowIndexRange } from '@/object-record/record-table/virtualization/utils/keepRecordIdsInRowIndexRange';

describe('keepRecordIdsInRowIndexRange', () => {
  it('keeps the record ids inside the range at their row index', () => {
    const recordIds: string[] = [];

    recordIds[0] = 'a';
    recordIds[2] = 'b';
    recordIds[3] = 'c';
    recordIds[5] = 'd';

    const recordIdsInRange = keepRecordIdsInRowIndexRange({
      recordIdsByRowIndex: recordIds,
      firstRowIndex: 1,
      lastRowIndex: 3,
    });

    expect(0 in recordIdsInRange).toBe(false);
    expect(recordIdsInRange[2]).toBe('b');
    expect(recordIdsInRange[3]).toBe('c');
    expect(5 in recordIdsInRange).toBe(false);
  });
});
