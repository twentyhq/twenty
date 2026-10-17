import { type ObjectRecord } from 'twenty-shared/types';

import { getRecordTableVirtualizationEffectForRecordOutsideWindow } from '@/object-record/record-table/virtualization/utils/getRecordTableVirtualizationEffectForRecordOutsideWindow';

const recordWithPosition = (position: unknown): ObjectRecord => ({
  id: `id-${String(position)}`,
  position,
});

const orderBy = [{ position: 'AscNullsFirst' as const }];

describe('getRecordTableVirtualizationEffectForRecordOutsideWindow', () => {
  it('only refreshes the count when the record sorts after the loaded window', () => {
    expect(
      getRecordTableVirtualizationEffectForRecordOutsideWindow({
        record: recordWithPosition(900),
        lastLoadedRecord: recordWithPosition(40),
        lastLoadedRealIndex: 39,
        totalNumberOfRecordsToVirtualize: 1800,
        isLoadingPages: false,
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
        isLoadingPages: false,
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
        isLoadingPages: false,
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
        isLoadingPages: false,
        orderBy,
      }),
    ).toBe('reset');

    expect(
      getRecordTableVirtualizationEffectForRecordOutsideWindow({
        record: recordWithPosition('first'),
        lastLoadedRecord: recordWithPosition(40),
        lastLoadedRealIndex: 39,
        totalNumberOfRecordsToVirtualize: 1800,
        isLoadingPages: false,
        orderBy,
      }),
    ).toBe('reset');
  });

  it('resets when the record does not carry the sort field', () => {
    expect(
      getRecordTableVirtualizationEffectForRecordOutsideWindow({
        record: { id: 'partial' },
        lastLoadedRecord: recordWithPosition(40),
        lastLoadedRealIndex: 39,
        totalNumberOfRecordsToVirtualize: 1800,
        isLoadingPages: false,
        orderBy: [{ position: 'AscNullsLast' }],
      }),
    ).toBe('reset');
  });

  it('resets while a page fetch is still filling the window', () => {
    expect(
      getRecordTableVirtualizationEffectForRecordOutsideWindow({
        record: recordWithPosition(900),
        lastLoadedRecord: recordWithPosition(40),
        lastLoadedRealIndex: 39,
        totalNumberOfRecordsToVirtualize: 1800,
        isLoadingPages: true,
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
        isLoadingPages: false,
        orderBy,
      }),
    ).toBe('reset');
  });
});
