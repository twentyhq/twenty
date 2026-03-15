import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { useLoadMinimalMetadata } from '@/metadata-store/hooks/useLoadMinimalMetadata';
import { useLoadMockedMinimalMetadata } from '@/metadata-store/hooks/useLoadMockedMinimalMetadata';
import { useLoadStaleMetadataEntities } from '@/metadata-store/hooks/useLoadStaleMetadataEntities';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCallback, useEffect, useState } from 'react';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';

export const MinimalMetadataLoadEffect = () => {
  const isLoggedIn = useIsLogged();
  const isCurrentUserLoaded = useAtomStateValue(isCurrentUserLoadedState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const [isLoading, setIsLoading] = useState(false);

  const { loadMinimalMetadata } = useLoadMinimalMetadata();
  const { loadMockedMinimalMetadata } = useLoadMockedMinimalMetadata();
  const { loadStaleMetadataEntities } = useLoadStaleMetadataEntities();

  const performLoad = useCallback(async () => {
    if (!isWorkspaceActiveOrSuspended(currentWorkspace)) {
      await loadMockedMinimalMetadata();
      return;
    }

    const result = await loadMinimalMetadata();

    if (result?.staleEntityKeys && result.staleEntityKeys.length > 0) {
      loadStaleMetadataEntities(result.staleEntityKeys);
    }
  }, [
    currentWorkspace,
    loadMinimalMetadata,
    loadMockedMinimalMetadata,
    loadStaleMetadataEntities,
  ]);

  useEffect(() => {
    if (!isCurrentUserLoaded || !isLoggedIn || isLoading) {
      return;
    }

    setIsLoading(true);
    performLoad().finally(() => {
      setIsLoading(false);
    });
  }, [isCurrentUserLoaded, isLoggedIn, isLoading, performLoad]);

  return null;
};
