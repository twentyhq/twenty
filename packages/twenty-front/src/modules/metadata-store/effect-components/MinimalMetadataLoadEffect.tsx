import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { useLoadMinimalMetadata } from '@/metadata-store/hooks/useLoadMinimalMetadata';
import { useLoadMockedMetadata } from '@/metadata-store/hooks/useLoadMockedMetadata';
import { useLoadStaleMetadataEntities } from '@/metadata-store/hooks/useLoadStaleMetadataEntities';
import { metadataLoadedVersionState } from '@/metadata-store/states/metadataLoadedVersionState';
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
  const metadataLoadedVersion = useAtomStateValue(metadataLoadedVersionState);
  const [lastMetadataLoadData, setLastMetadataLoadData] = useState<{
    state: LoadedState;
    version: number;
  }>({ state: 'none', version: -1 });

  const { loadMinimalMetadata } = useLoadMinimalMetadata();
  const { loadMockedMetadataAtomic } = useLoadMockedMetadata();
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

    const versionChanged =
      metadataLoadedVersion !== lastMetadataLoadData.version;

    if (!versionChanged && lastMetadataLoadData.state === desiredLoadState) {
      return;
    }

    setLastMetadataLoadData({
      state: desiredLoadState,
      version: metadataLoadedVersion,
    });

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
    lastMetadataLoadData,
    metadataLoadedVersion,
    loadMinimalMetadata,
    loadMockedMetadataAtomic,
    loadStaleMetadataEntities,
  ]);

  return null;
};
