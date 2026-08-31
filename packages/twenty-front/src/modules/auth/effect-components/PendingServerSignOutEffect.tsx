import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useEffect } from 'react';

import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { isPendingServerSignOutState } from '@/auth/states/isPendingServerSignOutState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SignOutDocument } from '~/generated-metadata/graphql';

// A signOut that never reached the server leaves the httpOnly cookie alive, and
// only the server can revoke it, so the next boot has to retry.
export const PendingServerSignOutEffect = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { isLoadedOnce } = useAtomStateValue(clientConfigApiStatusState);

  useEffect(() => {
    const retryPendingServerSignOut = async () => {
      if (!isLoadedOnce || !store.get(isPendingServerSignOutState.atom)) {
        return;
      }

      // Signing out now would revoke the session that sign-in just established.
      if (store.get(isCookieAuthActiveState.atom)) {
        store.set(isPendingServerSignOutState.atom, false);

        return;
      }

      try {
        // Never retried: a retry is issued seconds later and carries whatever
        // cookie exists by then, so it would revoke a session established in
        // the meantime. A failure waits for the next boot instead.
        await apolloClient.mutate({
          mutation: SignOutDocument,
          context: { skipRetry: true },
        });
        store.set(isPendingServerSignOutState.atom, false);
      } catch {}
    };

    void retryPendingServerSignOut();
  }, [apolloClient, isLoadedOnce, store]);

  return null;
};
