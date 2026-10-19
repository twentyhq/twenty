import { getRowIndexToInsertRecord } from '@/object-record/record-table/virtualization/utils/getRowIndexToInsertRecord';

const orderBy = [{ position: 'AscNullsFirst' as const }];

const loadedRow = (rowIndex: number, position: number) => ({
  rowIndex,
  record: { id: `id-${rowIndex}`, position },
});

const loadedRows = [
  loadedRow(10, 100),
  loadedRow(11, 110),
  loadedRow(12, 120),
  loadedRow(30, 300),
];

describe('getRowIndexToInsertRecord', () => {
  it('returns the index of the first loaded row sorted after the record', () => {
    expect(
      getRowIndexToInsertRecord({
        loadedRows,
        record: { id: 'new', position: 5 },
        totalNumberOfRows: 500,
        orderBy,
      }),
    ).toBe(10);

    expect(
      getRowIndexToInsertRecord({
        loadedRows,
        record: { id: 'new', position: 200 },
        totalNumberOfRows: 500,
        orderBy,
      }),
    ).toBe(30);
  });

  it('appends at the total when the record sorts after every loaded row', () => {
    expect(
      getRowIndexToInsertRecord({
        loadedRows,
        record: { id: 'new', position: 999 },
        totalNumberOfRows: 500,
        orderBy,
      }),
    ).toBe(500);
  });

  it('returns null on a tie or a missing sort value', () => {
    expect(
      getRowIndexToInsertRecord({
        loadedRows,
        record: { id: 'new', position: 110 },
        totalNumberOfRows: 500,
        orderBy,
      }),
    ).toBeNull();

    expect(
      getRowIndexToInsertRecord({
        loadedRows,
        record: { id: 'new' },
        totalNumberOfRows: 500,
        orderBy,
      }),
    ).toBeNull();
  });

  it('places an optimistic first or last position at the top or the end', () => {
    expect(
      getRowIndexToInsertRecord({
        loadedRows,
        record: { id: 'new', position: 'first' },
        totalNumberOfRows: 500,
        orderBy,
      }),
    ).toBe(0);

    expect(
      getRowIndexToInsertRecord({
        loadedRows,
        record: { id: 'new', position: 'last' },
        totalNumberOfRows: 500,
        orderBy,
      }),
    ).toBe(500);
  });
});
