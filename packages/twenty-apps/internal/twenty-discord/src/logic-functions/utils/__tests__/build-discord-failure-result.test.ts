import { describe, expect, it } from 'vitest';

import { buildDiscordFailureResult } from 'src/logic-functions/utils/build-discord-failure-result';

describe('buildDiscordFailureResult', () => {
  it('should surface the underlying Error message', () => {
    const result = buildDiscordFailureResult(
      'Failed to post Discord message',
      new Error('channel_not_found'),
    );

    expect(result).toEqual({
      success: false,
      message: 'Failed to post Discord message',
      error: 'channel_not_found',
    });
  });

  it('should use a generic error when the thrown value is not an Error', () => {
    const result = buildDiscordFailureResult('Failed to post Discord message', 'boom');

    expect(result).toEqual({
      success: false,
      message: 'Failed to post Discord message',
      error: 'Discord request failed',
    });
  });
});
