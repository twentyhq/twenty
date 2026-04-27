import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from 'jotai';

import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { hasInitializedAgentChatThreadsState } from '@/ai/states/hasInitializedAgentChatThreadsState';
import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { useAuth } from '@/auth/hooks/useAuth';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { clearSessionLocalStorageKeys } from '@/auth/utils/clearSessionLocalStorageKeys';
import { useInvalidateMetadataStore } from '@/metadata-store/hooks/useInvalidateMetadataStore';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useClearSseClient } from '@/sse-db-event/hooks/useClearSseClient';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { type AuthTokenPair } from '~/generated-metadata/graphql';

const IMPERSONATION_SESSION_KEY = 'impersonation_original_session';

type StoredImpersonationSession = {
  tokenPair: AuthTokenPair;
  returnPath: string;
};

export const useImpersonationSession = () => {
  const store = useStore();
  const client = useApolloClient();
  const navigate = useNavigate();
  const { getAuthTokensFromLoginToken, signOut } = useAuth();
  const { clearSseClient } = useClearSseClient();
  const { loadCurrentUser } = useLoadCurrentUser();
  const { invalidateMetadataStore } = useInvalidateMetadataStore();

  // Drop the previous user's client-side state so the new session does not
  // see stale favorites, AI chat threads, drafts, or last-visited views.
  // Without this, the localStorage-backed metadata store and a few in-memory
  // AI atoms keep the previous user's data because neither loadCurrentUser
  // nor MinimalMetadataLoadEffect re-runs on a same-workspace token swap.
  const resetUserScopedClientState = useCallback(() => {
    clearSessionLocalStorageKeys();

    store.set(currentAiChatThreadState.atom, null);
    store.set(agentChatInputState.atom, '');
    store.set(hasInitializedAgentChatThreadsState.atom, false);

    // agentChatThreads is not handled by useLoadStaleMetadataEntities, so it
    // is reset to 'empty' here to make AgentChatThreadInitializationEffect
    // refetch (or stay empty if the new user has no AI permission).
    store.set(metadataStoreState.atomFamily('agentChatThreads'), {
      current: [],
      draft: [],
      status: 'empty',
    });

    // Bump metadataLoadedVersion + clear collection hashes so
    // MinimalMetadataLoadEffect re-runs and refetches navigation menu items,
    // views, page layouts, etc. against the new token.
    invalidateMetadataStore();
  }, [store, invalidateMetadataStore]);

  const startImpersonating = useCallback(
    async (loginToken: string, returnPath?: string) => {
      const currentTokenPair = store.get(tokenPairState.atom);

      if (currentTokenPair) {
        const session: StoredImpersonationSession = {
          tokenPair: currentTokenPair,
          returnPath: returnPath ?? window.location.pathname,
        };
        sessionStorage.setItem(
          IMPERSONATION_SESSION_KEY,
          JSON.stringify(session),
        );
      }

      clearSseClient();
      await client.clearStore();
      resetUserScopedClientState();

      store.set(isAppEffectRedirectEnabledState.atom, false);
      await getAuthTokensFromLoginToken(loginToken);
      store.set(isAppEffectRedirectEnabledState.atom, true);
    },
    [
      store,
      client,
      clearSseClient,
      resetUserScopedClientState,
      getAuthTokensFromLoginToken,
    ],
  );

  const stopImpersonating = useCallback(async () => {
    const raw = sessionStorage.getItem(IMPERSONATION_SESSION_KEY);

    if (!raw) {
      // No stored session — likely a cross-workspace tab opened via redirect.
      // Try closing the tab (works when opened via window.open or target=_blank).
      window.close();
      // If window.close() was blocked by the browser, fall back to sign out.
      await signOut();
      return;
    }

    let session: StoredImpersonationSession;

    try {
      session = JSON.parse(raw);
    } catch {
      sessionStorage.removeItem(IMPERSONATION_SESSION_KEY);
      await signOut();
      return;
    }

    sessionStorage.removeItem(IMPERSONATION_SESSION_KEY);

    clearSseClient();
    await client.clearStore();
    resetUserScopedClientState();

    store.set(isAppEffectRedirectEnabledState.atom, false);
    store.set(tokenPairState.atom, session.tokenPair);

    await loadCurrentUser();

    store.set(isAppEffectRedirectEnabledState.atom, true);

    navigate(session.returnPath);
  }, [
    store,
    client,
    clearSseClient,
    resetUserScopedClientState,
    loadCurrentUser,
    signOut,
    navigate,
  ]);

  const hasStoredSession = useCallback(() => {
    return sessionStorage.getItem(IMPERSONATION_SESSION_KEY) !== null;
  }, []);

  return { startImpersonating, stopImpersonating, hasStoredSession };
};
