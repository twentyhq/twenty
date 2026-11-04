import { isSearchQueryWaitingForData } from '@/object-record/utils/isSearchQueryWaitingForData';

describe('isSearchQueryWaitingForData', () => {
  it('should not wait on a cached result that is refreshing', () => {
    expect(
      isSearchQueryWaitingForData({ loading: true, dataState: 'complete' }),
    ).toBe(false);
  });

  it('should wait while nothing is available for the current input', () => {
    expect(
      isSearchQueryWaitingForData({ loading: true, dataState: 'empty' }),
    ).toBe(true);
  });

  it('should not wait once the query has loaded', () => {
    expect(
      isSearchQueryWaitingForData({ loading: false, dataState: 'complete' }),
    ).toBe(false);
  });
});
