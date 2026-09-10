import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { useAuth } from '@/auth/hooks/useAuth';
import { useVerifyLogin } from '@/auth/hooks/useVerifyLogin';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { AppPath } from 'twenty-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';

import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

jest.mock('../useAuth', () => ({
  useAuth: jest.fn(),
}));

const mockEnqueueToast = jest.fn();
const mockEnqueueErrorToast = jest.fn();

jest.mock('twenty-ui/feedback', () => ({
  ...jest.requireActual('twenty-ui/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));
jest.mock('@/error-handler/hooks/useErrorToast', () => ({
  useErrorToast: () => ({ enqueueErrorToast: mockEnqueueErrorToast }),
}));

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: jest.fn(),
}));

dynamicActivate(SOURCE_LOCALE);

const renderHooks = () => {
  const { result } = renderHook(() => useVerifyLogin(), {
    wrapper: ({ children }) =>
      JotaiProvider({
        store: jotaiStore,
        children: I18nProvider({ i18n, children }),
      }),
  });
  return { result };
};

describe('useVerifyLogin', () => {
  const mockGetAuthTokensFromLoginToken = jest.fn();

  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    resetJotaiStore();

    (useAuth as jest.Mock).mockReturnValue({
      getAuthTokensFromLoginToken: mockGetAuthTokensFromLoginToken,
    });

    (useNavigateApp as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('should verify login token', async () => {
    const { result } = renderHooks();

    await result.current.verifyLoginToken('test-token');

    expect(mockGetAuthTokensFromLoginToken).toHaveBeenCalledWith('test-token');
  });

  it('should handle a non-GraphQL verification error', async () => {
    const error = new Error('Verification failed');
    mockGetAuthTokensFromLoginToken.mockRejectedValueOnce(error);

    const { result } = renderHooks();

    await result.current.verifyLoginToken('test-token');

    expect(mockEnqueueToast).toHaveBeenCalledWith({
      variant: 'error',
      children: 'Authentication failed',
    });
    expect(mockNavigate).toHaveBeenCalledWith(AppPath.SignInUp);
  });

  it('should preserve a GraphQL verification error for the toast', async () => {
    const error = new CombinedGraphQLErrors({
      errors: [{ message: 'Session could not be created' }],
    });
    mockGetAuthTokensFromLoginToken.mockRejectedValueOnce(error);

    const { result } = renderHooks();

    await result.current.verifyLoginToken('test-token');

    expect(mockEnqueueErrorToast).toHaveBeenCalledWith(error);
    expect(mockNavigate).toHaveBeenCalledWith(AppPath.SignInUp);
  });
});
