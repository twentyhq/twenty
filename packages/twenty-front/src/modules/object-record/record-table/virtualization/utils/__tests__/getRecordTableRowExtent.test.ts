import { getRecordTableRowExtent } from '@/object-record/record-table/virtualization/utils/getRecordTableRowExtent';

describe('getRecordTableRowExtent', () => {
  it('uses the exact count when available', () => {
    expect(
      getRecordTableRowExtent({
        totalCount: 10000000,
        numberOfRecords: 50,
        hasNextPage: true,
      }),
    ).toEqual({ totalNumberOfRows: 10000000, isTotalCountKnown: true });
  });

  it('reserves another page after a count timeout', () => {
    expect(
      getRecordTableRowExtent({ numberOfRecords: 50, hasNextPage: true }),
    ).toEqual({ totalNumberOfRows: 60, isTotalCountKnown: false });
  });

  it('grows without shrinking when an earlier page returns later', () => {
    const next = getRecordTableRowExtent({
      offset: 50,
      numberOfRecords: 20,
      hasNextPage: true,
      previousExtent: 60,
    });
    expect(next).toEqual({ totalNumberOfRows: 80, isTotalCountKnown: false });
    expect(
      getRecordTableRowExtent({
        offset: 20,
        numberOfRecords: 10,
        hasNextPage: true,
        previousExtent: next.totalNumberOfRows,
      }),
    ).toEqual(next);
  });

  it('discovers the exact end on the final nonempty page', () => {
    expect(
      getRecordTableRowExtent({
        offset: 70,
        numberOfRecords: 3,
        hasNextPage: false,
        previousExtent: 80,
      }),
    ).toEqual({ totalNumberOfRows: 73, isTotalCountKnown: true });
  });

  it('does not mistake an empty offset page for an exact total', () => {
    expect(
      getRecordTableRowExtent({
        offset: 70,
        numberOfRecords: 0,
        hasNextPage: false,
      }).isTotalCountKnown,
    ).toBe(false);
  });

  it('knows an empty first page has no records', () => {
    expect(
      getRecordTableRowExtent({ numberOfRecords: 0, hasNextPage: false }),
    ).toEqual({ totalNumberOfRows: 0, isTotalCountKnown: true });
  });

  it('respects widget record limits without an exact count', () => {
    expect(
      getRecordTableRowExtent({
        numberOfRecords: 50,
        hasNextPage: true,
        recordLimit: 50,
      }),
    ).toEqual({ totalNumberOfRows: 50, isTotalCountKnown: true });
    expect(
      getRecordTableRowExtent({
        numberOfRecords: 50,
        hasNextPage: true,
        recordLimit: 100,
      }),
    ).toEqual({ totalNumberOfRows: 60, isTotalCountKnown: false });
  });
});
