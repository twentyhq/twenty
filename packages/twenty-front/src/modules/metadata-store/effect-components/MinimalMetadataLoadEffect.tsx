import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { useLoadMinimalMetadata } from '@/metadata-store/hooks/useLoadMinimalMetadata';
import { useLoadMockedMinimalMetadata } from '@/metadata-store/hooks/useLoadMockedMinimalMetadata';
import { useLoadStaleMetadataEntities } from '@/metadata-store/hooks/useLoadStaleMetadataEntities';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect, useRef } from 'react';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';

export const MinimalMetadataLoadEffect = () => {
  const isLoggedIn = useIsLogged();
  const isCurrentUserLoaded = useAtomStateValue(isCurrentUserLoadedState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const isLoadingRef = useRef(false);

  const { loadMinimalMetadata } = useLoadMinimalMetadata();
  const { loadMockedMinimalMetadata } = useLoadMockedMinimalMetadata();
  const { loadStaleMetadataEntities } = useLoadStaleMetadataEntities();

  useEffect(() => {
    if (!isCurrentUserLoaded || !isLoggedIn) {
      return;
    }

    if (isLoadingRef.current) {
      return;
    }

    if (!isWorkspaceActiveOrSuspended(currentWorkspace)) {
      isLoadingRef.current = true;
      loadMockedMinimalMetadata().finally(() => {
        isLoadingRef.current = false;
      });

      return;
    }

    isLoadingRef.current = true;

    loadMinimalMetadata()
      .then((result) => {
        if (result?.staleEntityKeys && result.staleEntityKeys.length > 0) {
          loadStaleMetadataEntities(result.staleEntityKeys);
        }
      })
      .finally(() => {
        isLoadingRef.current = false;
      });
  }, [
    isCurrentUserLoaded,
    isLoggedIn,
    currentWorkspace,
    loadMinimalMetadata,
    loadMockedMinimalMetadata,
    loadStaleMetadataEntities,
  ]);

  return null;
};
