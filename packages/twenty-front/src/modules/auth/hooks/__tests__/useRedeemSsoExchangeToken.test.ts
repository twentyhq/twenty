import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { useRedeemSsoExchangeToken } from '@/auth/hooks/useRedeemSsoExchangeToken';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const mockGetAuthTokensFromSsoExchangeToken = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [mockGetAuthTokensFromSsoExchangeToken],
}));

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: jest.fn(),
}));

const renderHooks = () => {
  const { result } = renderHook(() => useRedeemSsoExchangeToken(), {
    wrapper: ({ children }) => JotaiProvider({ store: jotaiStore, children }),
  });

  return { result };
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

describe('useRedeemSsoExchangeToken', () => {
  const mockEnqueueErrorSnackBar = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    resetJotaiStore();

    (useSnackBar as jest.Mock).mockReturnValue({
      enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
    });

    mockGetAuthTokensFromSsoExchangeToken.mockResolvedValue({
      data: {
        getAuthTokensFromSSOExchangeToken: { tokens: freshTokenPair },
      },
    });
  });

  it('should disable the redirect effect while exchanging and restore it after', async () => {
    const redirectFlagsAtExchangeTime: unknown[] = [];

    mockGetAuthTokensFromSsoExchangeToken.mockImplementation(() => {
      redirectFlagsAtExchangeTime.push(
        jotaiStore.get(isAppEffectRedirectEnabledState.atom),
      );

      return Promise.resolve({
        data: { getAuthTokensFromSSOExchangeToken: { tokens: freshTokenPair } },
      });
    });

    const { result } = renderHooks();

    await result.current.redeemSsoExchangeToken('sso-exchange-token');

    expect(redirectFlagsAtExchangeTime).toEqual([false]);
    expect(jotaiStore.get(isAppEffectRedirectEnabledState.atom)).toBe(true);
  });

  // The cookie is httpOnly, so nothing else can tell the client it is now
  // signed in; without this the user stays on the sign-in flow.
  it('should mark the session active once the exchange succeeds', async () => {
    const { result } = renderHooks();

    await result.current.redeemSsoExchangeToken('sso-exchange-token');

    expect(jotaiStore.get(isCookieAuthActiveState.atom)).toBe(true);
  });

  it('should leave the session inactive when the exchange fails', async () => {
    mockGetAuthTokensFromSsoExchangeToken.mockRejectedValueOnce(
      new Error('Invalid SSO exchange token'),
    );

    const { result } = renderHooks();

    await result.current.redeemSsoExchangeToken('sso-exchange-token');

    expect(jotaiStore.get(isCookieAuthActiveState.atom)).toBe(false);
  });

  it('should snackbar when redemption fails', async () => {
    mockGetAuthTokensFromSsoExchangeToken.mockRejectedValueOnce(
      new Error('Invalid SSO exchange token'),
    );

    const { result } = renderHooks();

    await result.current.redeemSsoExchangeToken('sso-exchange-token');

    expect(mockEnqueueErrorSnackBar).toHaveBeenCalledWith({
      message: 'Invalid SSO exchange token',
    });
    expect(jotaiStore.get(isAppEffectRedirectEnabledState.atom)).toBe(true);
  });
});
