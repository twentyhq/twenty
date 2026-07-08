import { describe, expect, it } from 'vitest';

import { RECALL_API_ADHOC_POOL_RETRY_DELAY_MS } from 'src/logic-functions/constants/recall-api-adhoc-pool-retry-delay-ms';
import { RECALL_API_RETRY_DELAY_MS } from 'src/logic-functions/constants/recall-api-retry-delay-ms';
import {
  isRetryableRecallApiStatus,
  resolveRecallApiRetryDelayMs,
} from 'src/logic-functions/recall-api/recall-api-retry-policy.util';

describe('isRetryableRecallApiStatus', () => {
  it('retries rate limiting, conflicts, and server errors', () => {
    expect(isRetryableRecallApiStatus(429)).toBe(true);
    expect(isRetryableRecallApiStatus(409)).toBe(true);
    expect(isRetryableRecallApiStatus(500)).toBe(true);
    expect(isRetryableRecallApiStatus(502)).toBe(true);
    expect(isRetryableRecallApiStatus(503)).toBe(true);
    expect(isRetryableRecallApiStatus(504)).toBe(true);
    expect(isRetryableRecallApiStatus(507)).toBe(true);
  });

  it('does not retry client errors that cannot succeed on a retry', () => {
    expect(isRetryableRecallApiStatus(400)).toBe(false);
    expect(isRetryableRecallApiStatus(401)).toBe(false);
    expect(isRetryableRecallApiStatus(402)).toBe(false);
    expect(isRetryableRecallApiStatus(403)).toBe(false);
    expect(isRetryableRecallApiStatus(405)).toBe(false);
  });
});

describe('resolveRecallApiRetryDelayMs', () => {
  it('honors a server-provided Retry-After above all else', () => {
    expect(
      resolveRecallApiRetryDelayMs({
        retryAfterMs: 5000,
        status: 507,
        attemptNumber: 1,
      }),
    ).toBe(5000);
  });

  it('waits for the ad-hoc pool to refill on a 507 without a header', () => {
    expect(
      resolveRecallApiRetryDelayMs({
        retryAfterMs: undefined,
        status: 507,
        attemptNumber: 1,
      }),
    ).toBe(RECALL_API_ADHOC_POOL_RETRY_DELAY_MS);
  });

  it('backs off linearly by attempt for everything else', () => {
    expect(
      resolveRecallApiRetryDelayMs({
        retryAfterMs: undefined,
        status: 409,
        attemptNumber: 2,
      }),
    ).toBe(RECALL_API_RETRY_DELAY_MS * 2);
  });
});
