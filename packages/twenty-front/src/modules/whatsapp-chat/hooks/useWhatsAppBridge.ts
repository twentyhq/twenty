import { useCallback } from 'react';

import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { renewToken } from '@/auth/services/AuthService';
import { WHATSAPP_BRIDGE_URL } from '@/whatsapp-chat/constants/WhatsAppBridgeUrl';
import { cookieStorage } from '~/utils/cookie-storage';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

interface BridgeFetchOptions extends RequestInit {
  skipContentType?: boolean;
}

// Deduplicate concurrent renewal attempts
let renewalPromise: Promise<void> | null = null;

export const useWhatsAppBridge = () => {
  const tokenPair = useRecoilValueV2(tokenPairState);
  const setTokenPair = useSetRecoilStateV2(tokenPairState);

  const getLatestToken = useCallback((): string | undefined => {
    // Read from cookie in case Apollo already refreshed it
    try {
      const raw = cookieStorage.getItem('tokenPair');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?.accessOrWorkspaceAgnosticToken?.token;
      }
    } catch {
      // fall through
    }
    return tokenPair?.accessOrWorkspaceAgnosticToken?.token;
  }, [tokenPair]);

  const refreshAndGetToken = useCallback(async (): Promise<string | null> => {
    const graphqlUri = `${REACT_APP_SERVER_BASE_URL}/metadata`;

    if (!renewalPromise) {
      renewalPromise = renewToken(graphqlUri, tokenPair)
        .then((tokens) => {
          if (tokens) {
            setTokenPair(tokens);
            cookieStorage.setItem('tokenPair', JSON.stringify(tokens));
          }
        })
        .finally(() => {
          renewalPromise = null;
        });
    }

    await renewalPromise;

    return getLatestToken() ?? null;
  }, [tokenPair, setTokenPair, getLatestToken]);

  const doFetch = useCallback(
    async <T = unknown>(
      path: string,
      options: BridgeFetchOptions,
      token: string | undefined,
    ): Promise<Response> => {
      const { skipContentType, ...fetchOptions } = options;
      const headers = new Headers(fetchOptions.headers);

      if (!skipContentType && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return fetch(`${WHATSAPP_BRIDGE_URL}${path}`, {
        ...fetchOptions,
        headers,
      });
    },
    [],
  );

  const bridgeFetch = useCallback(
    async <T = unknown>(
      path: string,
      options: BridgeFetchOptions = {},
    ): Promise<T> => {
      let token = tokenPair?.accessOrWorkspaceAgnosticToken?.token;

      let response = await doFetch<T>(path, options, token);

      if (response.status === 401) {
        // Try with latest cookie token first (Apollo may have already refreshed)
        const cookieToken = getLatestToken();
        if (cookieToken && cookieToken !== token) {
          token = cookieToken;
          response = await doFetch<T>(path, options, token);
        }

        // Still 401 — actively refresh the token
        if (response.status === 401) {
          const newToken = await refreshAndGetToken();
          if (newToken) {
            response = await doFetch<T>(path, options, newToken);
          }
        }

        // Still failing — redirect to login
        if (response.status === 401) {
          window.location.href = '/';
          throw new Error('Session expired');
        }
      }

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');
        throw new Error(
          `Bridge API error ${response.status}: ${errorBody}`,
        );
      }

      const text = await response.text();

      if (!text) {
        return undefined as T;
      }

      return JSON.parse(text) as T;
    },
    [tokenPair, doFetch, getLatestToken, refreshAndGetToken],
  );

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const token = tokenPair?.accessOrWorkspaceAgnosticToken?.token ?? '';

    return `${protocol}//${host}${WHATSAPP_BRIDGE_URL}/ws?token=${encodeURIComponent(token)}`;
  }, [tokenPair]);

  return { bridgeFetch, getWebSocketUrl };
};
