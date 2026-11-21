import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getTeamsConnectorRetryDelayMs } from 'src/features/chat/logic-functions/utils/get-teams-connector-retry-delay-ms';

describe('getTeamsConnectorRetryDelayMs', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should double the backoff on each attempt', () => {
    expect(
      getTeamsConnectorRetryDelayMs({
        attempt: 0,
        retryAfter: null,
        maxDelayMs: 4_000,
      }),
    ).toBe(1_000);
    expect(
      getTeamsConnectorRetryDelayMs({
        attempt: 1,
        retryAfter: null,
        maxDelayMs: 4_000,
      }),
    ).toBe(2_000);
  });

  it('should add up to the jitter ratio on top of the backoff', () => {
    vi.spyOn(Math, 'random').mockReturnValue(1);

    expect(
      getTeamsConnectorRetryDelayMs({
        attempt: 0,
        retryAfter: null,
        maxDelayMs: 4_000,
      }),
    ).toBe(1_250);
  });

  it('should cap the backoff at the remaining budget', () => {
    expect(
      getTeamsConnectorRetryDelayMs({
        attempt: 2,
        retryAfter: null,
        maxDelayMs: 1_500,
      }),
    ).toBe(1_500);
  });

  it('should wait for Retry-After, but never less than the base delay', () => {
    expect(
      getTeamsConnectorRetryDelayMs({
        attempt: 0,
        retryAfter: '3',
        maxDelayMs: 4_000,
      }),
    ).toBe(3_000);
    expect(
      getTeamsConnectorRetryDelayMs({
        attempt: 0,
        retryAfter: '0',
        maxDelayMs: 4_000,
      }),
    ).toBe(1_000);
  });

  it('should give up when Retry-After or its floor exceeds the remaining budget', () => {
    expect(
      getTeamsConnectorRetryDelayMs({
        attempt: 0,
        retryAfter: '5',
        maxDelayMs: 4_000,
      }),
    ).toBe(0);
    expect(
      getTeamsConnectorRetryDelayMs({
        attempt: 1,
        retryAfter: '0',
        maxDelayMs: 500,
      }),
    ).toBe(0);
  });
});
