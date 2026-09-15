import { ErrorCode } from '@slack/web-api';
import { describe, expect, it } from 'vitest';

import { slackToolFailure } from 'src/logic-functions/utils/slack-tool-failure';

describe('slackToolFailure', () => {
  it('should surface the underlying Error message', () => {
    const result = slackToolFailure(
      'Failed to post Slack message',
      new Error('channel_not_found'),
    );

    expect(result).toEqual({
      success: false,
      message: 'Failed to post Slack message',
      error: 'channel_not_found',
    });
  });

  it('should use a generic error when the thrown value is not an Error', () => {
    const result = slackToolFailure('Failed to post Slack message', 'boom');

    expect(result).toEqual({
      success: false,
      message: 'Failed to post Slack message',
      error: 'Slack request failed',
    });
  });

  it('should surface the Retry-After so callers can defer delivery', () => {
    const result = slackToolFailure(
      'Failed to post Slack message',
      Object.assign(new Error('A rate limit was exceeded'), {
        code: ErrorCode.RateLimitedError,
        retryAfter: 30,
      }),
    );

    expect(result.retryAfterSeconds).toBe(30);
  });

  it('should leave the Retry-After unset for every other Slack error', () => {
    const result = slackToolFailure(
      'Failed to post Slack message',
      new Error('channel_not_found'),
    );

    expect(result.retryAfterSeconds).toBeUndefined();
  });
});
