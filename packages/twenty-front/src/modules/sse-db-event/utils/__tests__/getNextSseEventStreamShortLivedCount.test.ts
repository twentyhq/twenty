import { getNextSseEventStreamShortLivedCount } from '@/sse-db-event/utils/getNextSseEventStreamShortLivedCount';

describe('getNextSseEventStreamShortLivedCount', () => {
  it('should increment the count when the stream lived under a minute', () => {
    expect(
      getNextSseEventStreamShortLivedCount({
        shortLivedStreamCount: 2,
        createdAtTimestamp: 1_000,
        destroyedAtTimestamp: 60_999,
      }),
    ).toBe(3);
  });

  it('should reset the count when the stream lived a minute or more', () => {
    expect(
      getNextSseEventStreamShortLivedCount({
        shortLivedStreamCount: 2,
        createdAtTimestamp: 1_000,
        destroyedAtTimestamp: 61_000,
      }),
    ).toBe(0);
  });

  it('should reset the count when the creation time is unknown', () => {
    expect(
      getNextSseEventStreamShortLivedCount({
        shortLivedStreamCount: 2,
        createdAtTimestamp: null,
        destroyedAtTimestamp: 61_000,
      }),
    ).toBe(0);
  });
});
