import { getDataPagesLoadedFromLoadingStatus } from '@/object-record/record-table/virtualization/utils/getDataPagesLoadedFromLoadingStatus';

const loadedRange = (from: number, to: number) =>
  new Map<number, 'loaded' | 'not-loaded'>(
    Array.from({ length: to - from + 1 }, (_, offset) => [
      from + offset,
      'loaded',
    ]),
  );

describe('getDataPagesLoadedFromLoadingStatus', () => {
  it('keeps only fully loaded pages', () => {
    expect(
      getDataPagesLoadedFromLoadingStatus({
        dataLoadingStatusByRealIndex: loadedRange(1, 29),
        totalNumberOfRecordsToVirtualize: 100,
      }),
    ).toEqual([1, 2]);
  });

  it('treats a partial last page as loaded when every existing index is loaded', () => {
    expect(
      getDataPagesLoadedFromLoadingStatus({
        dataLoadingStatusByRealIndex: loadedRange(0, 24),
        totalNumberOfRecordsToVirtualize: 25,
      }),
    ).toEqual([0, 1, 2]);
  });

  it('ignores indices that are not loaded', () => {
    const dataLoadingStatusByRealIndex = loadedRange(0, 19);

    dataLoadingStatusByRealIndex.set(15, 'not-loaded');

    expect(
      getDataPagesLoadedFromLoadingStatus({
        dataLoadingStatusByRealIndex,
        totalNumberOfRecordsToVirtualize: 100,
      }),
    ).toEqual([0]);
  });
});
