import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { useLoadMinimalMetadata } from '@/metadata-store/hooks/useLoadMinimalMetadata';
import { useMetadataStoreActions } from '@/metadata-store/hooks/useMetadataStoreActions';
import { useLoadStaleMetadataEntities } from '@/metadata-store/hooks/useLoadStaleMetadataEntities';
import { metadataLoadVersionState } from '@/metadata-store/states/metadataLoadVersionState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect, useRef, useState } from 'react';
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
  const loadVersion = useAtomStateValue(metadataLoadVersionState);
  const [loadedState, setLoadedState] = useState<LoadedState>('none');
  const lastLoadedVersionRef = useRef(-1);

  const { loadMinimalMetadata } = useLoadMinimalMetadata();
  const { loadMockedMetadataAtomic } = useMetadataStoreActions();
  const { loadStaleMetadataEntities } = useLoadStaleMetadataEntities();

  const isActiveWorkspace = isWorkspaceActiveOrSuspended(currentWorkspace);

  const desiredLoadState = computeDesiredLoadState(
    hasAccessTokenPair,
    isActiveWorkspace,
  );

  useEffect(() => {
    if (!isCurrentUserLoaded) {
      return;
    }

    const versionChanged = loadVersion !== lastLoadedVersionRef.current;

    if (!versionChanged && loadedState === desiredLoadState) {
      return;
    }

    lastLoadedVersionRef.current = loadVersion;
    setLoadedState(desiredLoadState);

    const performLoad = async () => {
      if (desiredLoadState === 'mocked') {
        await loadMockedMetadataAtomic();
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
    loadVersion,
    loadMinimalMetadata,
    loadMockedMetadataAtomic,
    loadStaleMetadataEntities,
  ]);

  return null;
};
