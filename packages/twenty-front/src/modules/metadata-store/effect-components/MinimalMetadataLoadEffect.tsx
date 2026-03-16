import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { useLoadMinimalMetadata } from '@/metadata-store/hooks/useLoadMinimalMetadata';
import { useLoadMockedMinimalMetadata } from '@/metadata-store/hooks/useLoadMockedMinimalMetadata';
import { useLoadStaleMetadataEntities } from '@/metadata-store/hooks/useLoadStaleMetadataEntities';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect, useState } from 'react';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';

type LoadedState = 'none' | 'mocked' | 'real';

const computeDesiredLoadState = (
  hasAccessTokenPair: boolean,
  isActiveWorkspace: boolean,
): LoadedState => {
  if (hasAccessTokenPair && isActiveWorkspace) {
    return 'real';
  }

  return 'mocked';
};

export const MinimalMetadataLoadEffect = () => {
  const hasAccessTokenPair = useHasAccessTokenPair();
  const isCurrentUserLoaded = useAtomStateValue(isCurrentUserLoadedState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const [loadedState, setLoadedState] = useState<LoadedState>('none');

  const { loadMinimalMetadata } = useLoadMinimalMetadata();
  const { loadMockedMinimalMetadata } = useLoadMockedMinimalMetadata();
  const { loadStaleMetadataEntities } = useLoadStaleMetadataEntities();

  const isActiveWorkspace = isWorkspaceActiveOrSuspended(currentWorkspace);

  const desiredLoadState = computeDesiredLoadState(
    hasAccessTokenPair,
    isActiveWorkspace,
  );

  useEffect(() => {
    if (!isCurrentUserLoaded || loadedState === desiredLoadState) {
      return;
    }

    setLoadedState(desiredLoadState);

    const performLoad = async () => {
      if (desiredLoadState === 'mocked') {
        await loadMockedMinimalMetadata();
        return;
      }

      const result = await loadMinimalMetadata();

      if (result?.staleEntityKeys && result.staleEntityKeys.length > 0) {
        await loadStaleMetadataEntities(result.staleEntityKeys);
      }
    };

    performLoad();
  }, [
    isCurrentUserLoaded,
    hasAccessTokenPair,
    isActiveWorkspace,
    desiredLoadState,
    loadedState,
    loadMinimalMetadata,
    loadMockedMinimalMetadata,
    loadStaleMetadataEntities,
  ]);

  return null;
};
