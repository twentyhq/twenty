import { useCallback, useEffect, useState } from 'react';
import { callPropelRoute } from '@/propel/lib/callPropelRoute';
import { type HubPayload } from '@/propel/types/oneOnOne';

// Loads the role-aware 1:1 hub payload from POST /s/one-on-one/hub. The route
// SERVER-DERIVES the acting member from the session token (it never trusts a
// client-sent identity), so we send an empty body — exactly like the in-sandbox
// hub, minus the actingUserId fallback the front-component needed.
//
// Fails soft: a null route response leaves `payload === null`, which the page
// renders as an honest "couldn't load" state with a Retry — it never throws or
// fabricates a tier/count.

export type OneOnOneHubState = {
  payload: HubPayload | null;
  isLoading: boolean;
  /** true once at least one fetch attempt has settled (success or failure) */
  loaded: boolean;
  reload: () => void;
};

export const useOneOnOneHubData = (): OneOnOneHubState => {
  const [payload, setPayload] = useState<HubPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void callPropelRoute<HubPayload>('/one-on-one/hub', {}).then((res) => {
      if (!active) return;
      setPayload(res);
      setIsLoading(false);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [nonce]);

  return { payload, isLoading, loaded, reload };
};
