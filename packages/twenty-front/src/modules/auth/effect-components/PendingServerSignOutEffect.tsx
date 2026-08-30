import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useEffect } from 'react';

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

      try {
        await apolloClient.mutate({ mutation: SignOutDocument });
        store.set(isPendingServerSignOutState.atom, false);
      } catch {}
    };

    void retryPendingServerSignOut();
  }, [apolloClient, isLoadedOnce, store]);

  return null;
};
