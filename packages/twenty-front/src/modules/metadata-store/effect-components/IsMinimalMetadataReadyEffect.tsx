import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';

export const IsMinimalMetadataReadyEffect = () => {
  const hasAccessTokenPair = useHasAccessTokenPair();
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const metadataStore = useAtomFamilyStateValue(
    metadataStoreState,
    'objectMetadataItems',
  );
  // oxlint-disable-next-line twenty/matching-state-variable
  const metadataStoreViews = useAtomFamilyStateValue(
    metadataStoreState,
    'views',
  );
  const setIsMinimalMetadataReady = useSetAtomState(
    isMinimalMetadataReadyState,
  );

  useEffect(() => {
    const hasActiveWorkspace = isWorkspaceActiveOrSuspended(currentWorkspace);

    const areObjectsLoaded = metadataStore.status === 'up-to-date';
    const areViewsLoaded = metadataStoreViews.status === 'up-to-date';

    const isReady = !areObjectsLoaded
      ? false
      : !hasAccessTokenPair ||
        (isDefined(currentUser) && (!hasActiveWorkspace || areViewsLoaded));

    if (!areObjectsLoaded) {
      setIsMinimalMetadataReady(false);
      return;
    }

    setIsMinimalMetadataReady(isReady);
  }, [
    hasAccessTokenPair,
    currentUser,
    currentWorkspace,
    metadataStore.status,
    metadataStoreViews.status,
    setIsMinimalMetadataReady,
  ]);

  return null;
};
