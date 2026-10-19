import { getRowIndexToInsertRecord } from '@/object-record/record-table/virtualization/utils/getRowIndexToInsertRecord';

const orderBy = [{ position: 'AscNullsFirst' as const }];

const loadedRow = ({
  rowIndex,
  position,
}: {
  rowIndex: number;
  position: number;
}) => ({ rowIndex, position });

const loadedRows = [
  loadedRow({ rowIndex: 10, position: 100 }),
  loadedRow({ rowIndex: 11, position: 110 }),
  loadedRow({ rowIndex: 12, position: 120 }),
  loadedRow({ rowIndex: 30, position: 300 }),
];

describe('getRowIndexToInsertRecord', () => {
  it('returns the index of the first loaded row sorted after the record', () => {
    expect(
      getRowIndexToInsertRecord({
        loadedRows,
        position: 5,
        totalNumberOfRows: 500,
        orderBy,
      }),
    ).toBe(10);

    expect(
      getRowIndexToInsertRecord({
        loadedRows,
        position: 200,
        totalNumberOfRows: 500,
        orderBy,
      }),
    ).toBe(30);
  });

  it('appends at the total when the record sorts after every loaded row', () => {
    expect(
      getRowIndexToInsertRecord({
        loadedRows,
        position: 999,
        totalNumberOfRows: 500,
        orderBy,
      }),
    ).toBe(500);
  });

  it('returns null on a tie or a missing sort value', () => {
    expect(
      getRowIndexToInsertRecord({
        loadedRows,
        position: 110,
        totalNumberOfRows: 500,
        orderBy,
      }),
    ).toBeNull();

    expect(
      getRowIndexToInsertRecord({
        loadedRows,
        position: undefined,
        totalNumberOfRows: 500,
        orderBy,
      }),
    ).toBeNull();
  });

  it('places an optimistic first or last position at the top or the end', () => {
    expect(
      getRowIndexToInsertRecord({
        loadedRows,
        position: 'first',
        totalNumberOfRows: 500,
        orderBy,
      }),
    ).toBe(0);

    expect(
      getRowIndexToInsertRecord({
        loadedRows,
        position: 'last',
        totalNumberOfRows: 500,
        orderBy,
      }),
    ).toBe(500);
  });

  it('mirrors the placement for a descending position sort', () => {
    expect(
      getRowIndexToInsertRecord({
        loadedRows: [
          loadedRow({ rowIndex: 0, position: 300 }),
          loadedRow({ rowIndex: 1, position: 200 }),
        ],
        position: 250,
        totalNumberOfRows: 2,
        orderBy: [{ position: 'DescNullsLast' }],
      }),
    ).toBe(1);

    expect(
      getRowIndexToInsertRecord({
        loadedRows,
        position: 'first',
        totalNumberOfRows: 500,
        orderBy: [{ position: 'DescNullsLast' }],
      }),
    ).toBe(500);
  });

  it('returns null when the view is not sorted by position', () => {
    expect(
      getRowIndexToInsertRecord({
        loadedRows,
        position: 5,
        totalNumberOfRows: 500,
        orderBy: [{ name: 'AscNullsFirst' }],
      }),
    ).toBeNull();
  });
});
