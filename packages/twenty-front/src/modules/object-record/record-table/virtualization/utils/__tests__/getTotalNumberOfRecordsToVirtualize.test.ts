import { getTotalNumberOfRecordsToVirtualize } from '@/object-record/record-table/virtualization/utils/getTotalNumberOfRecordsToVirtualize';

describe('getTotalNumberOfRecordsToVirtualize', () => {
  it('trusts a count within its limit', () => {
    expect(
      getTotalNumberOfRecordsToVirtualize({
        totalCount: 120,
        totalCountLimit: 10_000,
      }),
    ).toEqual({ totalNumberOfRecordsToVirtualize: 120, isLowerBound: false });
  });

  it('treats a count past its limit as a lower bound', () => {
    expect(
      getTotalNumberOfRecordsToVirtualize({
        totalCount: 10_001,
        totalCountLimit: 10_000,
      }),
    ).toEqual({ totalNumberOfRecordsToVirtualize: 10_001, isLowerBound: true });
  });

  it('stops at the record limit, which makes the total exact', () => {
    expect(
      getTotalNumberOfRecordsToVirtualize({
        totalCount: 10_001,
        totalCountLimit: 10_000,
        recordLimit: 500,
      }),
    ).toEqual({ totalNumberOfRecordsToVirtualize: 500, isLowerBound: false });
  });
});
