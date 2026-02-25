import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isAppMetadataReadyState } from '@/metadata-store/states/isAppMetadataReadyState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';

export const IsAppMetadataReadyEffect = () => {
  const isLoggedIn = useIsLogged();
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const objectMetadataItemsEntry = useAtomFamilyStateValue(
    metadataStoreState,
    'objectMetadataItems',
  );
  const viewsEntry = useAtomFamilyStateValue(metadataStoreState, 'views');
  const setIsAppMetadataReady = useSetAtomState(isAppMetadataReadyState);

  useEffect(() => {
    const hasActiveWorkspace = isWorkspaceActiveOrSuspended(currentWorkspace);

    const areObjectsLoaded = objectMetadataItemsEntry.status === 'up-to-date';
    const areViewsLoaded = viewsEntry.status === 'up-to-date';

    if (!areObjectsLoaded) {
      setIsAppMetadataReady(false);
      return;
    }

    const isReady =
      !isLoggedIn ||
      (isDefined(currentUser) && (!hasActiveWorkspace || areViewsLoaded));

    setIsAppMetadataReady(isReady);
  }, [
    isLoggedIn,
    currentUser,
    currentWorkspace,
    objectMetadataItemsEntry.status,
    viewsEntry.status,
    setIsAppMetadataReady,
  ]);

  return null;
};
