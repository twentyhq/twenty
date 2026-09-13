import { FathomError } from 'fathom-typescript/sdk/models/errors';
import { describe, expect, it } from 'vitest';

import { getFathomRetryAfterDelay } from 'src/logic-functions/utils/get-fathom-retry-after-delay.util';

const NOW = new Date('2026-09-05T12:00:00.000Z');

describe('getFathomRetryAfterDelay', () => {
  it.each([
    ['120', 120_000],
    ['0', 0],
    ['1.5', 1_500],
    [' 90 ', 90_000],
    ['Sat, 05 Sep 2026 12:02:00 GMT', 120_000],
    ['Sat, 05 Sep 2026 12:00:00 GMT', 0],
    ['Sat, 05 Sep 2026 11:59:00 GMT', 60_000],
    [undefined, 60_000],
    ['', 60_000],
    [' ', 60_000],
    ['invalid', 60_000],
    ['-1', 60_000],
    ['Infinity', 60_000],
    ['NaN', 60_000],
    ['1e309', 60_000],
    ['1e308', 60_000],
  ])(
    'delays retry-after %s by %i milliseconds',
    (retryAfter, expectedDelay) => {
      const error = new FathomError('Rate limit exceeded', {
        request: new Request('https://api.fathom.ai/external/v1/meetings'),
        response: new Response(null, {
          status: 429,
          headers:
            retryAfter === undefined ? {} : { 'retry-after': retryAfter },
        }),
        body: '',
      });

      expect(getFathomRetryAfterDelay({ error, now: NOW })).toBe(expectedDelay);
    },
  );

  it('does not classify other Fathom errors as rate limits', () => {
    const error = new FathomError('Service unavailable', {
      request: new Request('https://api.fathom.ai/external/v1/meetings'),
      response: new Response(null, {
        status: 503,
        headers: { 'retry-after': '120' },
      }),
      body: '',
    });

    expect(getFathomRetryAfterDelay({ error, now: NOW })).toBeUndefined();
  });

  it.each([undefined, null, new Error('Request failed'), { statusCode: 429 }])(
    'ignores errors without a Fathom rate-limit response: %s',
    (error) => {
      expect(getFathomRetryAfterDelay({ error, now: NOW })).toBeUndefined();
    },
  );
});
