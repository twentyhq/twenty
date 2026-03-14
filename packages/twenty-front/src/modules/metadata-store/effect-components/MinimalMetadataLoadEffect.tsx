import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { useLoadMinimalMetadata } from '@/metadata-store/hooks/useLoadMinimalMetadata';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';
import { useEffect, useState } from 'react';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';

export const MinimalMetadataLoadEffect = () => {
  const isLoggedIn = useIsLogged();
  const isCurrentUserLoaded = useAtomStateValue(isCurrentUserLoadedState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const store = useStore();
  const [hasLoaded, setHasLoaded] = useState(false);

  const { loadMinimalMetadata } = useLoadMinimalMetadata();

  useEffect(() => {
    if (hasLoaded) {
      return;
    }

    if (!isCurrentUserLoaded || !isLoggedIn) {
      return;
    }

    if (!isWorkspaceActiveOrSuspended(currentWorkspace)) {
      return;
    }

    const objectsEntry = store.get(
      metadataStoreState.atomFamily('objectMetadataItems'),
    );
    const viewsEntry = store.get(metadataStoreState.atomFamily('views'));

    const hasObjectsFromStorage = objectsEntry.status === 'up-to-date';
    const hasViewsFromStorage = viewsEntry.status === 'up-to-date';

    if (hasObjectsFromStorage && hasViewsFromStorage) {
      setHasLoaded(true);

      return;
    }

    const load = async () => {
      await loadMinimalMetadata();
      setHasLoaded(true);
    };

    load();
  }, [
    hasLoaded,
    isCurrentUserLoaded,
    isLoggedIn,
    currentWorkspace,
    store,
    loadMinimalMetadata,
  ]);

  return null;
};
