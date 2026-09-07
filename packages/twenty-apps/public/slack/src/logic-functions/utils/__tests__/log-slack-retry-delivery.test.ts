import { afterEach, describe, expect, it, vi } from 'vitest';

import { logSlackRetryDelivery } from 'src/logic-functions/utils/log-slack-retry-delivery';

describe('logSlackRetryDelivery', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not log when the request is a first delivery', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    logSlackRetryDelivery({
      headers: { 'x-slack-signature': 'v0=abc' },
      source: 'events',
    });

    expect(warn).not.toHaveBeenCalled();
  });

  it('should log the attempt and reason when the request is a retry', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    logSlackRetryDelivery({
      headers: {
        'x-slack-retry-num': '2',
        'x-slack-retry-reason': 'http_timeout',
      },
      source: 'events',
    });

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      '[slack] events retry delivery: attempt 2, reason http_timeout',
    );
  });

  it('should fall back to an unknown reason when Slack omits it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    logSlackRetryDelivery({
      headers: { 'x-slack-retry-num': '1' },
      source: 'events',
    });

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      '[slack] events retry delivery: attempt 1, reason unknown',
    );
  });

  it('should fall back to an unknown reason when Slack sends an empty one', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    logSlackRetryDelivery({
      headers: { 'x-slack-retry-num': '1', 'x-slack-retry-reason': '' },
      source: 'events',
    });

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      '[slack] events retry delivery: attempt 1, reason unknown',
    );
  });
});
