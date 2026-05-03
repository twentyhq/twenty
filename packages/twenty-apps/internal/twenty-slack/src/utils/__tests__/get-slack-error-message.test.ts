import { ErrorCode } from '@slack/web-api';
import { describe, expect, it } from 'vitest';

import { getSlackErrorMessage } from '../get-slack-error-message';

type PlatformErrorShape = Error & {
  code: ErrorCode.PlatformError;
  data: { ok: false; error: string };
};

const createPlatformError = (slackError: string): PlatformErrorShape => {
  const error = new Error(
    `An API error occurred: ${slackError}`,
  ) as PlatformErrorShape;

  error.code = ErrorCode.PlatformError;
  error.data = { ok: false, error: slackError };

  return error;
};

describe('getSlackErrorMessage', () => {
  it('returns Slack API error from platform errors', () => {
    const error = createPlatformError('channel_not_found');

    expect(getSlackErrorMessage(error)).toBe('channel_not_found');
  });

  it('returns Error.message for generic errors', () => {
    expect(getSlackErrorMessage(new Error('network down'))).toBe(
      'network down',
    );
  });

  it('returns fallback for unknown values', () => {
    expect(getSlackErrorMessage(null)).toBe('slack_request_failed');
    expect(getSlackErrorMessage(undefined)).toBe('slack_request_failed');
    expect(getSlackErrorMessage({})).toBe('slack_request_failed');
  });
});
