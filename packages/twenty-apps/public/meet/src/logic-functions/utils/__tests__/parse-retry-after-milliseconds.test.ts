import { describe, expect, it } from 'vitest';

import { parseRetryAfterMilliseconds } from 'src/logic-functions/utils/parse-retry-after-milliseconds.util';

const NOW = new Date('2026-11-17T08:00:00.000Z');

describe('parseRetryAfterMilliseconds', () => {
  it('should read a delay in seconds', () => {
    expect(parseRetryAfterMilliseconds({ retryAfter: '7', now: NOW })).toBe(
      7_000,
    );
  });

  it('should read the delay until an HTTP date', () => {
    expect(
      parseRetryAfterMilliseconds({
        retryAfter: 'Tue, 17 Nov 2026 08:00:05 GMT',
        now: NOW,
      }),
    ).toBe(5_000);
  });

  it.each([null, '', '0', 'soon', 'Tue, 17 Nov 2026 07:59:00 GMT'])(
    'should give no delay for %j',
    (retryAfter) => {
      expect(
        parseRetryAfterMilliseconds({ retryAfter, now: NOW }),
      ).toBeUndefined();
    },
  );
});
