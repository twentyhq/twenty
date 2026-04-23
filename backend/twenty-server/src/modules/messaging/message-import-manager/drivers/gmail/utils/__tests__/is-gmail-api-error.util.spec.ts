import { GaxiosError } from 'gaxios';

import { isGmailApiError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-api-error.util';

describe('isGmailApiError', () => {
  it('should detect Gmail API error shape even when instanceof GaxiosError fails', () => {
    const originalError = new GaxiosError(
      'Rate limit exceeded',
      {},
      {
        status: 429,
        statusText: 'Too Many Requests',
        headers: {},
        config: {},
        request: { responseURL: '' },
        data: {
          error: {
            errors: [
              { reason: 'rateLimitExceeded', message: 'Rate limit exceeded' },
            ],
          },
        },
      },
    );

    const serialized = JSON.parse(JSON.stringify(originalError));

    expect(serialized instanceof GaxiosError).toBe(false);
    expect(isGmailApiError(serialized)).toBe(true);
  });

  it('should detect error when data.error is a string instead of object', () => {
    const error = {
      response: {
        status: 429,
        data: {
          error: 'userRateLimitExceeded',
          error_description: 'User Rate Limit Exceeded',
        },
      },
    };

    expect(isGmailApiError(error)).toBe(true);
  });

  it('should reject network errors that have no response', () => {
    const networkError = new Error('connect ECONNREFUSED');

    expect(isGmailApiError(networkError)).toBe(false);
  });
});
