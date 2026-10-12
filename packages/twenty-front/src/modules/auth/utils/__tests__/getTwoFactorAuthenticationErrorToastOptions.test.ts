import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { getTwoFactorAuthenticationErrorToastOptions } from '@/auth/utils/getTwoFactorAuthenticationErrorToastOptions';

describe('getTwoFactorAuthenticationErrorToastOptions', () => {
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
      getTwoFactorAuthenticationErrorToastOptions({
        error,
        dedupeKey: 'invalid-otp-dedupe-key',
      }),
    ).toEqual(
      expect.objectContaining({
        variant: 'error',
        children: 'Rate limit reached. Please try again later.',
        dedupeKey: 'invalid-otp-dedupe-key-LIMIT_REACHED',
      }),
    );
  });

  it('falls back to the invalid code message for a non-GraphQL error', () => {
    expect(
      getTwoFactorAuthenticationErrorToastOptions({
        error: new Error('Network error'),
      }),
    ).toEqual({
      variant: 'error',
      children: 'Invalid verification code. Please try again.',
      dedupeKey: undefined,
    });
  });

  it('uses the given fallback message for a non-GraphQL error', () => {
    expect(
      getTwoFactorAuthenticationErrorToastOptions({
        error: new Error('Network error'),
        fallbackMessage: 'Two factor authentication provisioning failed.',
      }),
    ).toEqual(
      expect.objectContaining({
        children: 'Two factor authentication provisioning failed.',
      }),
    );
  });
});
