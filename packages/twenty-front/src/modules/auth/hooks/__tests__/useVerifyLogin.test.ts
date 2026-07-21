import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { AppPath } from 'twenty-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useAuth } from '@/auth/hooks/useAuth';
import { useVerifyLogin } from '@/auth/hooks/useVerifyLogin';
import { tokenPairState } from '@/auth/states/tokenPairState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

jest.mock('../useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: jest.fn(),
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

const staleTokenPair = {
  accessOrWorkspaceAgnosticToken: {
    token: 'stale-access-token',
    expiresAt: '2020-01-01T00:00:00.000Z',
  },
  refreshToken: {
    token: 'stale-refresh-token',
    expiresAt: '2020-01-01T00:00:00.000Z',
  },
};

describe('useVerifyLogin', () => {
  const mockGetAuthTokensFromLoginToken = jest.fn();
  const mockEnqueueErrorSnackBar = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    resetJotaiStore();

    (useAuth as jest.Mock).mockReturnValue({
      getAuthTokensFromLoginToken: mockGetAuthTokensFromLoginToken,
    });

    (useSnackBar as jest.Mock).mockReturnValue({
      enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
    });

    (useNavigateApp as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('should verify login token', async () => {
    const { result } = renderHooks();

    await result.current.verifyLoginToken('test-token');

    expect(mockGetAuthTokensFromLoginToken).toHaveBeenCalledWith('test-token');
  });

  it('should clear the existing token pair before exchanging the login token', async () => {
    jotaiStore.set(tokenPairState.atom, staleTokenPair);
    const tokenPairsAtExchangeTime: unknown[] = [];
    mockGetAuthTokensFromLoginToken.mockImplementation(() => {
      tokenPairsAtExchangeTime.push(jotaiStore.get(tokenPairState.atom));
    });

    const { result } = renderHooks();

    await result.current.verifyLoginToken('test-token');

    expect(tokenPairsAtExchangeTime).toEqual([null]);
  });

  it('should handle verification error', async () => {
    const error = new Error('Verification failed');
    mockGetAuthTokensFromLoginToken.mockRejectedValueOnce(error);

    const { result } = renderHooks();

    await result.current.verifyLoginToken('test-token');

    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
      message: 'Authentication failed',
    });
    expect(mockNavigate).toHaveBeenCalledWith(AppPath.SignInUp);
  });
});
