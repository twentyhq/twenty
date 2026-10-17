import { getRecordTableVirtualizationEffectForRecordOutsideWindow } from '@/object-record/record-table/virtualization/utils/getRecordTableVirtualizationEffectForRecordOutsideWindow';

const recordWithPosition = (position: unknown) =>
  ({ id: `id-${String(position)}`, position }) as never;

const orderBy = [{ position: 'AscNullsFirst' as const }];

describe('getRecordTableVirtualizationEffectForRecordOutsideWindow', () => {
  it('only refreshes the count when the record sorts after the loaded window', () => {
    expect(
      getRecordTableVirtualizationEffectForRecordOutsideWindow({
        record: recordWithPosition(900),
        lastLoadedRecord: recordWithPosition(40),
        lastLoadedRealIndex: 39,
        totalNumberOfRecordsToVirtualize: 1800,
        orderBy,
      }),
    ).toBe('refresh-count');
  });

  it('resets when the record sorts inside or before the loaded window', () => {
    expect(
      getRecordTableVirtualizationEffectForRecordOutsideWindow({
        record: recordWithPosition(10),
        lastLoadedRecord: recordWithPosition(40),
        lastLoadedRealIndex: 39,
        totalNumberOfRecordsToVirtualize: 1800,
        orderBy,
      }),
    ).toBe('reset');
  });

  it('resets when the loaded window already reaches the end of the table', () => {
    expect(
      getRecordTableVirtualizationEffectForRecordOutsideWindow({
        record: recordWithPosition(900),
        lastLoadedRecord: recordWithPosition(40),
        lastLoadedRealIndex: 39,
        totalNumberOfRecordsToVirtualize: 40,
        orderBy,
      }),
    ).toBe('reset');
  });

  it('resets on a tie or when the records cannot be compared', () => {
    expect(
      getRecordTableVirtualizationEffectForRecordOutsideWindow({
        record: recordWithPosition(40),
        lastLoadedRecord: recordWithPosition(40),
        lastLoadedRealIndex: 39,
        totalNumberOfRecordsToVirtualize: 1800,
        orderBy,
      }),
    ).toBe('reset');

    expect(
      getRecordTableVirtualizationEffectForRecordOutsideWindow({
        record: recordWithPosition('first'),
        lastLoadedRecord: recordWithPosition(40),
        lastLoadedRealIndex: 39,
        totalNumberOfRecordsToVirtualize: 1800,
        orderBy,
      }),
    ).toBe('reset');
  });

  it('resets when nothing is loaded yet', () => {
    expect(
      getRecordTableVirtualizationEffectForRecordOutsideWindow({
        record: recordWithPosition(900),
        lastLoadedRecord: null,
        lastLoadedRealIndex: null,
        totalNumberOfRecordsToVirtualize: null,
        orderBy,
      }),
    ).toBe('reset');
  });
});
