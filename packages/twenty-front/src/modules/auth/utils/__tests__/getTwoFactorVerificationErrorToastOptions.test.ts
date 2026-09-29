import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { getTwoFactorVerificationErrorToastOptions } from '@/auth/utils/getTwoFactorVerificationErrorToastOptions';

describe('getTwoFactorVerificationErrorToastOptions', () => {
  it('shows the server message when verification is rate limited', () => {
    const error = new CombinedGraphQLErrors({
      errors: [
        {
          message: 'Limit reached (10 tokens per 900000 ms)',
          extensions: {
            subCode: 'LIMIT_REACHED',
            userFriendlyMessage: 'Rate limit reached. Please try again later.',
          },
        },
      ],
    });

    expect(
      getTwoFactorVerificationErrorToastOptions({
        error,
        dedupeKey: 'invalid-otp-dedupe-key',
      }),
    ).toEqual(
      expect.objectContaining({
        variant: 'error',
        children: 'Rate limit reached. Please try again later.',
        dedupeKey: 'invalid-otp-dedupe-key',
      }),
    );
  });

  it('falls back to the invalid code message for a non-GraphQL error', () => {
    expect(
      getTwoFactorVerificationErrorToastOptions({
        error: new Error('Network error'),
      }),
    ).toEqual({
      variant: 'error',
      children: 'Invalid verification code. Please try again.',
      dedupeKey: undefined,
    });
  });
});
