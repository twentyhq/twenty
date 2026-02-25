import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { useFetchAndLoadIndexViews } from '@/metadata-store/hooks/useFetchAndLoadIndexViews';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect, useState } from 'react';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';

export const ViewMetadataProviderInitialEffect = () => {
  const isLoggedIn = useIsLogged();
  const isCurrentUserLoaded = useAtomStateValue(isCurrentUserLoadedState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const [isInitialized, setIsInitialized] = useState(false);

  const { fetchAndLoadIndexViews } = useFetchAndLoadIndexViews();

  useEffect(() => {
    if (isInitialized) {
      return;
    }
    if (!isCurrentUserLoaded) {
      return;
    }

    if (!isLoggedIn || !isWorkspaceActiveOrSuspended(currentWorkspace)) {
      setIsInitialized(true);
      return;
    }

    const initialize = async () => {
      await fetchAndLoadIndexViews();

      setIsInitialized(true);
    };

    initialize();
  }, [
    isInitialized,
    isCurrentUserLoaded,
    isLoggedIn,
    currentWorkspace,
    fetchAndLoadIndexViews,
  ]);

  return null;
};
