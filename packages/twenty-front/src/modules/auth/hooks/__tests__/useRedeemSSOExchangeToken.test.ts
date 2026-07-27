import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { useRedeemSSOExchangeToken } from '@/auth/hooks/useRedeemSSOExchangeToken';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const mockGetAuthTokensFromSSOExchangeToken = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [mockGetAuthTokensFromSSOExchangeToken],
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: jest.fn(),
}));

const renderHooks = () => {
  const { result } = renderHook(() => useRedeemSSOExchangeToken(), {
    wrapper: ({ children }) => JotaiProvider({ store: jotaiStore, children }),
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

const freshTokenPair = {
  accessOrWorkspaceAgnosticToken: {
    token: 'fresh-access-token',
    expiresAt: '2100-01-01T00:00:00.000Z',
  },
  refreshToken: {
    token: 'fresh-refresh-token',
    expiresAt: '2100-01-01T00:00:00.000Z',
  },
};

describe('useRedeemSSOExchangeToken', () => {
  const mockEnqueueErrorSnackBar = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    resetJotaiStore();

    (useSnackBar as jest.Mock).mockReturnValue({
      enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
    });

    mockGetAuthTokensFromSSOExchangeToken.mockResolvedValue({
      data: {
        getAuthTokensFromSSOExchangeToken: { tokens: freshTokenPair },
      },
    });
  });

  it('should store the redeemed token pair', async () => {
    const { result } = renderHooks();

    await result.current.redeemSSOExchangeToken('sso-exchange-token');

    expect(mockGetAuthTokensFromSSOExchangeToken).toHaveBeenCalledWith({
      variables: { ssoExchangeToken: 'sso-exchange-token' },
    });
    expect(jotaiStore.get(tokenPairState.atom)).toEqual(freshTokenPair);
  });

  it('should clear the existing token pair before exchanging', async () => {
    jotaiStore.set(tokenPairState.atom, staleTokenPair);

    const tokenPairsAtExchangeTime: unknown[] = [];

    mockGetAuthTokensFromSSOExchangeToken.mockImplementation(() => {
      tokenPairsAtExchangeTime.push(jotaiStore.get(tokenPairState.atom));

      return Promise.resolve({
        data: { getAuthTokensFromSSOExchangeToken: { tokens: freshTokenPair } },
      });
    });

    const { result } = renderHooks();

    await result.current.redeemSSOExchangeToken('sso-exchange-token');

    expect(tokenPairsAtExchangeTime).toEqual([null]);
  });

  it('should disable the redirect effect while exchanging and restore it after', async () => {
    const redirectFlagsAtExchangeTime: unknown[] = [];

    mockGetAuthTokensFromSSOExchangeToken.mockImplementation(() => {
      redirectFlagsAtExchangeTime.push(
        jotaiStore.get(isAppEffectRedirectEnabledState.atom),
      );

      return Promise.resolve({
        data: { getAuthTokensFromSSOExchangeToken: { tokens: freshTokenPair } },
      });
    });

    const { result } = renderHooks();

    await result.current.redeemSSOExchangeToken('sso-exchange-token');

    expect(redirectFlagsAtExchangeTime).toEqual([false]);
    expect(jotaiStore.get(isAppEffectRedirectEnabledState.atom)).toBe(true);
  });

  it('should snackbar and leave no token pair when redemption fails', async () => {
    mockGetAuthTokensFromSSOExchangeToken.mockRejectedValueOnce(
      new Error('Invalid SSO exchange token'),
    );

    const { result } = renderHooks();

    await result.current.redeemSSOExchangeToken('sso-exchange-token');

    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
      message: 'Invalid SSO exchange token',
    });
    expect(jotaiStore.get(tokenPairState.atom)).toBeNull();
    expect(jotaiStore.get(isAppEffectRedirectEnabledState.atom)).toBe(true);
  });
});
