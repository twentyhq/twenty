import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { createElement, type ReactNode } from 'react';

import { useImpersonationSession } from '@/auth/hooks/useImpersonationSession';
import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { type AuthTokenPair } from '~/generated-metadata/graphql';

const stopImpersonationMock = jest.fn();
const signOutMock = jest.fn();
const getAuthTokensFromLoginTokenMock = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useMutation: () => [stopImpersonationMock],
}));

jest.mock('@/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    getAuthTokensFromLoginToken: (...args: unknown[]) =>
      getAuthTokensFromLoginTokenMock(...args),
    signOut: () => signOutMock(),
  }),
}));

const IMPERSONATION_SESSION_KEY = 'impersonation_original_session';

const ADMIN_TOKEN_PAIR: AuthTokenPair = {
  accessOrWorkspaceAgnosticToken: { token: 'admin-access', expiresAt: '' },
  refreshToken: { token: 'admin-refresh', expiresAt: '' },
};

const closeMock = jest.fn();

const setup = () => {
  const store = createStore();

  store.set(isCookieAuthActiveState.atom, true);
  store.set(tokenPairState.atom, null);

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(Provider, { store }, children);

  const { result } = renderHook(() => useImpersonationSession(), { wrapper });

  return { store, result };
};

describe('useImpersonationSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();

    window.history.replaceState(null, '', '/impersonated');
    window.close = closeMock;
  });

  describe('stopImpersonating under cookie auth', () => {
    it('should let the server hand the impersonator session back when it can', async () => {
      stopImpersonationMock.mockResolvedValue({
        data: { stopImpersonation: { canRestoreImpersonatorSession: true } },
      });
      sessionStorage.setItem(
        IMPERSONATION_SESSION_KEY,
        JSON.stringify({
          tokenPair: ADMIN_TOKEN_PAIR,
          returnPath: '/admin-panel',
        }),
      );

      const { store, result } = setup();

      await act(async () => {
        await result.current.stopImpersonating();
      });

      expect(store.get(tokenPairState.atom)).toBeNull();
      expect(store.get(isCookieAuthActiveState.atom)).toBe(true);
      expect(sessionStorage.getItem(IMPERSONATION_SESSION_KEY)).toBeNull();
      expect(signOutMock).not.toHaveBeenCalled();
    });

    // The server cleared the session cookie on its way out, and startImpersonating
    // had already dropped the token pair. Signing out here would end a session the
    // admin still holds, and leaving cookie auth on would strand the tab with no
    // credential at all.
    it('should restore the parked token pair when the server cannot hand the session back', async () => {
      stopImpersonationMock.mockResolvedValue({
        data: { stopImpersonation: { canRestoreImpersonatorSession: false } },
      });
      sessionStorage.setItem(
        IMPERSONATION_SESSION_KEY,
        JSON.stringify({
          tokenPair: ADMIN_TOKEN_PAIR,
          returnPath: '/admin-panel',
        }),
      );

      const { store, result } = setup();

      await act(async () => {
        await result.current.stopImpersonating();
      });

      expect(store.get(tokenPairState.atom)).toEqual(ADMIN_TOKEN_PAIR);
      expect(store.get(isCookieAuthActiveState.atom)).toBe(false);
      expect(signOutMock).not.toHaveBeenCalled();
    });

    it('should restore the parked token pair when the mutation itself fails', async () => {
      stopImpersonationMock.mockRejectedValue(new Error('network'));
      sessionStorage.setItem(
        IMPERSONATION_SESSION_KEY,
        JSON.stringify({
          tokenPair: ADMIN_TOKEN_PAIR,
          returnPath: '/admin-panel',
        }),
      );

      const { store, result } = setup();

      await act(async () => {
        await result.current.stopImpersonating();
      });

      expect(store.get(tokenPairState.atom)).toEqual(ADMIN_TOKEN_PAIR);
      expect(store.get(isCookieAuthActiveState.atom)).toBe(false);
      expect(signOutMock).not.toHaveBeenCalled();
    });

    // A tab opened on the impersonated workspace's own origin never parked
    // anything, so there is nothing to go back to.
    it('should sign out when nothing was parked on this origin', async () => {
      stopImpersonationMock.mockResolvedValue({
        data: { stopImpersonation: { canRestoreImpersonatorSession: false } },
      });

      const { store, result } = setup();

      await act(async () => {
        await result.current.stopImpersonating();
      });

      expect(store.get(tokenPairState.atom)).toBeNull();
      expect(signOutMock).toHaveBeenCalled();
    });
  });
});
