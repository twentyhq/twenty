import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { useTwoFactorVerificationForSettings } from '@/settings/two-factor-authentication/hooks/useTwoFactorVerificationForSettings';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

const mockEnqueueToast = jest.fn();
const mockVerifyTwoFactorAuthenticationMethod = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: jest.fn(),
}));

jest.mock('twenty-ui/components', () => ({
  ...jest.requireActual('twenty-ui/components'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

jest.mock('@/users/hooks/useLoadCurrentUser', () => ({
  useLoadCurrentUser: () => ({ loadCurrentUser: jest.fn() }),
}));

jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: () => jest.fn(),
}));

dynamicActivate(SOURCE_LOCALE);

const renderVerificationHook = () =>
  renderHook(() => useTwoFactorVerificationForSettings(), {
    wrapper: ({ children }) => I18nProvider({ i18n, children }),
  });

describe('useTwoFactorVerificationForSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useMutation as jest.Mock).mockReturnValue([
      mockVerifyTwoFactorAuthenticationMethod,
    ]);
  });

  it('shows the server message when verification is rate limited', async () => {
    mockVerifyTwoFactorAuthenticationMethod.mockRejectedValueOnce(
      new CombinedGraphQLErrors({
        errors: [
          {
            message: 'Limit reached (10 tokens per 900000 ms)',
            extensions: {
              subCode: 'LIMIT_REACHED',
              userFriendlyMessage:
                'Rate limit reached. Please try again later.',
            },
          },
        ],
      }),
    );

    const { result } = renderVerificationHook();

    await act(() => result.current.handleSave({ otp: '000000' }));

    expect(mockEnqueueToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'error',
        children: 'Rate limit reached. Please try again later.',
      }),
    );
  });

  it('falls back to the invalid code message for a non-GraphQL error', async () => {
    mockVerifyTwoFactorAuthenticationMethod.mockRejectedValueOnce(
      new Error('Network error'),
    );

    const { result } = renderVerificationHook();

    await act(() => result.current.handleSave({ otp: '000000' }));

    expect(mockEnqueueToast).toHaveBeenCalledWith({
      variant: 'error',
      children: 'Invalid verification code. Please try again.',
    });
  });
});
