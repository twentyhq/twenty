import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useIsOnAuthOrOnboardingPage } from '@/auth/hooks/useIsOnAuthOrOnboardingPage';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { useLoadMinimalMetadata } from '@/metadata-store/hooks/useLoadMinimalMetadata';
import { useLoadStaleMetadataEntities } from '@/metadata-store/hooks/useLoadStaleMetadataEntities';
import { metadataLoadedVersionState } from '@/metadata-store/states/metadataLoadedVersionState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isWorkspaceProvisioned } from 'twenty-shared/workspace';

export const MinimalMetadataLoadEffect = () => {
  const isLogged = useIsLogged();
  const isCurrentUserLoaded = useAtomStateValue(isCurrentUserLoadedState);
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const metadataLoadedVersion = useAtomStateValue(metadataLoadedVersionState);
  const [lastLoadedVersion, setLastLoadedVersion] = useState<number>(-1);
  // The in-flight guard must also block Strict Mode effect replays before a render.
  // oxlint-disable-next-line twenty/no-state-useref
  const isLoadingRef = useRef(false);

  const { loadMinimalMetadata } = useLoadMinimalMetadata();
  const { loadStaleMetadataEntities } = useLoadStaleMetadataEntities();

  const isOnAuthOrOnboardingPage = useIsOnAuthOrOnboardingPage();

  const isProvisionedWorkspace = isWorkspaceProvisioned(currentWorkspace);
  const shouldLoadRealMetadata =
    isLogged && isProvisionedWorkspace && !isOnAuthOrOnboardingPage;

  useEffect(() => {
    if (!isCurrentUserLoaded && !isDefined(currentUser)) {
      return;
    }

    if (!shouldLoadRealMetadata) {
      return;
    }

    if (isLoadingRef.current || metadataLoadedVersion === lastLoadedVersion) {
      return;
    }

    isLoadingRef.current = true;

    const performLoad = async () => {
      try {
        const result = await loadMinimalMetadata();

        if (result?.staleEntityKeys && result.staleEntityKeys.length > 0) {
          await loadStaleMetadataEntities(result.staleEntityKeys);
        }
      } finally {
        // A resync requested during this load runs afterwards, so an older
        // response cannot overwrite a newer snapshot.
        isLoadingRef.current = false;
        setLastLoadedVersion(metadataLoadedVersion);
      }
    };

    performLoad();
  }, [
    isCurrentUserLoaded,
    currentUser,
    shouldLoadRealMetadata,
    lastLoadedVersion,
    metadataLoadedVersion,
    loadMinimalMetadata,
    loadStaleMetadataEntities,
  ]);

  return null;
};
