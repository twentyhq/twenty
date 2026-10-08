import { ConnectionError } from 'fathom-typescript/sdk/models/errors';
import { describe, expect, it } from 'vitest';

import { buildFathomNotFoundError } from 'src/__tests__/utils/build-fathom-not-found-error.util';
import { buildFathomRateLimitError } from 'src/__tests__/utils/build-fathom-rate-limit-error.util';
import { buildFathomServerError } from 'src/__tests__/utils/build-fathom-server-error.util';
import { getFathomRequeueDelay } from 'src/logic-functions/utils/get-fathom-requeue-delay.util';

const NOW = new Date('2026-09-05T12:00:00.000Z');

describe('getFathomRequeueDelay', () => {
  it('waits for the Retry-After delay of a rate limit', () => {
    expect(
      getFathomRequeueDelay({
        error: buildFathomRateLimitError('90'),
        now: NOW,
      }),
    ).toBe(90_000);
  });

  it('caps a Retry-After delay at five minutes', () => {
    expect(
      getFathomRequeueDelay({
        error: buildFathomRateLimitError('3600'),
        now: NOW,
      }),
    ).toBe(300_000);
  });

  it.each([
    ['a rate limit without Retry-After', buildFathomRateLimitError()],
    ['a Fathom outage', buildFathomServerError()],
    ['a network failure', new ConnectionError('connection refused')],
  ])('waits a minute after %s', (_description, error) => {
    expect(getFathomRequeueDelay({ error, now: NOW })).toBe(60_000);
  });

  it.each([
    ['a permanent Fathom rejection', buildFathomNotFoundError()],
    ['an unexpected error', new Error('boom')],
  ])('does not re-enqueue after %s', (_description, error) => {
    expect(getFathomRequeueDelay({ error, now: NOW })).toBeUndefined();
  });
});
