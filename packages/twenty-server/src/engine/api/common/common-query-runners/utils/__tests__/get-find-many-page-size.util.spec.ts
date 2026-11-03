import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

import { getFindManyPageSize } from 'src/engine/api/common/common-query-runners/utils/get-find-many-page-size.util';

describe('getFindManyPageSize', () => {
  it('defaults to QUERY_MAX_RECORDS', () => {
    expect(getFindManyPageSize({})).toBe(QUERY_MAX_RECORDS);
  });

  it('keeps a page size under the cap', () => {
    expect(getFindManyPageSize({ first: 10 })).toBe(10);
    expect(getFindManyPageSize({ last: 5 })).toBe(5);
  });

  it('caps a page size over QUERY_MAX_RECORDS', () => {
    expect(getFindManyPageSize({ first: 2147483647 })).toBe(QUERY_MAX_RECORDS);
    expect(getFindManyPageSize({ last: QUERY_MAX_RECORDS + 1 })).toBe(
      QUERY_MAX_RECORDS,
    );
  });

  it('keeps a page size over QUERY_MAX_RECORDS when bypassing the cap', () => {
    expect(
      getFindManyPageSize({ first: 1000, shouldBypassQueryMaxRecords: true }),
    ).toBe(1000);
  });
});
