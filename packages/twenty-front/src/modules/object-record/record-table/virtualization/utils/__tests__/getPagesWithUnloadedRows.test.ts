import { getPagesWithUnloadedRows } from '@/object-record/record-table/virtualization/utils/getPagesWithUnloadedRows';

const buildRecordIds = (rowIndexes: number[]) => {
  const recordIds: string[] = [];

  rowIndexes.forEach((rowIndex) => {
    recordIds[rowIndex] = `record-${rowIndex}`;
  });

  return recordIds;
};

describe('getPagesWithUnloadedRows', () => {
  it('keeps only the pages that have a row without a record id', () => {
    const loadedRowIndexes = [
      ...Array.from({ length: 15 }, (_, rowIndex) => rowIndex),
      ...Array.from({ length: 5 }, (_, offset) => 20 + offset),
    ];

    expect(
      getPagesWithUnloadedRows({
        pages: [0, 1, 2],
        recordIdsByRowIndex: buildRecordIds(loadedRowIndexes),
        totalNumberOfRows: 25,
      }),
    ).toEqual([1]);
  });
});
