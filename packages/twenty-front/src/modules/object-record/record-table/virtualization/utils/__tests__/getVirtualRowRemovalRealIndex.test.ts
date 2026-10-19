import { type LoadedVirtualRow } from '@/object-record/record-table/virtualization/types/LoadedVirtualRow';
import { getVirtualRowRemovalRealIndex } from '@/object-record/record-table/virtualization/utils/getVirtualRowRemovalRealIndex';

const orderBy = [{ position: 'AscNullsFirst' as const }];

const loadedRow = (realIndex: number, position: number): LoadedVirtualRow => ({
  realIndex,
  record: { id: `id-${realIndex}`, position },
});

const loadedRows = [
  loadedRow(10, 100),
  loadedRow(11, 110),
  loadedRow(30, 300),
  loadedRow(31, 310),
];

describe('getVirtualRowRemovalRealIndex', () => {
  it('removes the last index when the record sorts after every loaded row', () => {
    expect(
      getVirtualRowRemovalRealIndex({
        loadedRows,
        record: { id: 'gone', position: 999 },
        totalNumberOfRecordsToVirtualize: 500,
        orderBy,
      }),
    ).toBe(499);
  });

  it('returns null when the loaded rows already reach the end of the table', () => {
    expect(
      getVirtualRowRemovalRealIndex({
        loadedRows,
        record: { id: 'gone', position: 999 },
        totalNumberOfRecordsToVirtualize: 32,
        orderBy,
      }),
    ).toBeNull();
  });

  it('removes the index just before the first loaded row that sorts after the record', () => {
    expect(
      getVirtualRowRemovalRealIndex({
        loadedRows,
        record: { id: 'gone', position: 5 },
        totalNumberOfRecordsToVirtualize: 500,
        orderBy,
      }),
    ).toBe(9);

    expect(
      getVirtualRowRemovalRealIndex({
        loadedRows,
        record: { id: 'gone', position: 200 },
        totalNumberOfRecordsToVirtualize: 500,
        orderBy,
      }),
    ).toBe(29);
  });

  it('returns null when no unloaded index can hold the record', () => {
    expect(
      getVirtualRowRemovalRealIndex({
        loadedRows,
        record: { id: 'gone', position: 105 },
        totalNumberOfRecordsToVirtualize: 500,
        orderBy,
      }),
    ).toBeNull();

    expect(
      getVirtualRowRemovalRealIndex({
        loadedRows: [loadedRow(0, 100)],
        record: { id: 'gone', position: 5 },
        totalNumberOfRecordsToVirtualize: 500,
        orderBy,
      }),
    ).toBeNull();
  });
});
