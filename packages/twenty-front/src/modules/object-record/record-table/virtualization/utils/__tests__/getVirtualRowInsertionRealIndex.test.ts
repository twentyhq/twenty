import { type LoadedVirtualRow } from '@/object-record/record-table/virtualization/types/LoadedVirtualRow';
import { getVirtualRowInsertionRealIndex } from '@/object-record/record-table/virtualization/utils/getVirtualRowInsertionRealIndex';

const orderBy = [{ position: 'AscNullsFirst' as const }];

const loadedRow = (realIndex: number, position: number): LoadedVirtualRow => ({
  realIndex,
  record: { id: `id-${realIndex}`, position },
});

const loadedRows = [
  loadedRow(10, 100),
  loadedRow(11, 110),
  loadedRow(12, 120),
  loadedRow(30, 300),
  loadedRow(31, 310),
];

describe('getVirtualRowInsertionRealIndex', () => {
  it('appends after every loaded row at the total', () => {
    expect(
      getVirtualRowInsertionRealIndex({
        loadedRows,
        record: { id: 'new', position: 999 },
        totalNumberOfRecordsToVirtualize: 500,
        orderBy,
      }),
    ).toBe(500);
  });

  it('shifts from the first loaded row when the record sorts before it', () => {
    expect(
      getVirtualRowInsertionRealIndex({
        loadedRows,
        record: { id: 'new', position: 5 },
        totalNumberOfRecordsToVirtualize: 500,
        orderBy,
      }),
    ).toBe(10);
  });

  it('shifts from the first loaded row that sorts after the record', () => {
    expect(
      getVirtualRowInsertionRealIndex({
        loadedRows,
        record: { id: 'new', position: 115 },
        totalNumberOfRecordsToVirtualize: 500,
        orderBy,
      }),
    ).toBe(12);

    expect(
      getVirtualRowInsertionRealIndex({
        loadedRows,
        record: { id: 'new', position: 200 },
        totalNumberOfRecordsToVirtualize: 500,
        orderBy,
      }),
    ).toBe(30);
  });

  it('returns null on a tie, an incomparable value or no loaded rows', () => {
    expect(
      getVirtualRowInsertionRealIndex({
        loadedRows,
        record: { id: 'new', position: 110 },
        totalNumberOfRecordsToVirtualize: 500,
        orderBy,
      }),
    ).toBeNull();

    expect(
      getVirtualRowInsertionRealIndex({
        loadedRows,
        record: { id: 'new' },
        totalNumberOfRecordsToVirtualize: 500,
        orderBy,
      }),
    ).toBeNull();

    expect(
      getVirtualRowInsertionRealIndex({
        loadedRows: [],
        record: { id: 'new', position: 1 },
        totalNumberOfRecordsToVirtualize: 500,
        orderBy,
      }),
    ).toBeNull();
  });
});
