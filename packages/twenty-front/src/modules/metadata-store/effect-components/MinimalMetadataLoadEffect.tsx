import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { useLoadMinimalMetadata } from '@/metadata-store/hooks/useLoadMinimalMetadata';
import { useLoadStaleMetadataEntities } from '@/metadata-store/hooks/useLoadStaleMetadataEntities';
import { metadataLoadedVersionState } from '@/metadata-store/states/metadataLoadedVersionState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect, useState } from 'react';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';

export const MinimalMetadataLoadEffect = () => {
  const hasAccessTokenPair = useHasAccessTokenPair();
  const isCurrentUserLoaded = useAtomStateValue(isCurrentUserLoadedState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const metadataLoadedVersion = useAtomStateValue(metadataLoadedVersionState);
  const [lastLoadedVersion, setLastLoadedVersion] = useState<number>(-1);

  const { loadMinimalMetadata } = useLoadMinimalMetadata();
  const { loadStaleMetadataEntities } = useLoadStaleMetadataEntities();

  const isActiveWorkspace = isWorkspaceActiveOrSuspended(currentWorkspace);
  const shouldLoadRealMetadata = hasAccessTokenPair && isActiveWorkspace;

  useEffect(() => {
    if (!isCurrentUserLoaded) {
      return;
    }

    if (!shouldLoadRealMetadata) {
      return;
    }

    if (metadataLoadedVersion === lastLoadedVersion) {
      return;
    }

    setLastLoadedVersion(metadataLoadedVersion);

    const performLoad = async () => {
      const result = await loadMinimalMetadata();

      if (result?.staleEntityKeys && result.staleEntityKeys.length > 0) {
        await loadStaleMetadataEntities(result.staleEntityKeys);
      }
    };

    performLoad();
  }, [
    isCurrentUserLoaded,
    shouldLoadRealMetadata,
    lastLoadedVersion,
    metadataLoadedVersion,
    loadMinimalMetadata,
    loadStaleMetadataEntities,
  ]);

  return null;
};
