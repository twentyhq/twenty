import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useEffect } from 'react';

import { isCookieAuthActiveState } from '@/auth/states/isCookieAuthActiveState';
import { isPendingServerSignOutState } from '@/auth/states/isPendingServerSignOutState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SignOutDocument } from '~/generated-metadata/graphql';

// Only the server can revoke the httpOnly cookie, so a signOut that never reached it is retried on next boot.
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
        // Never retried: a delayed retry would carry, and revoke, a session established in the meantime.
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
