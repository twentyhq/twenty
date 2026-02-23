import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isAppMetadataReadyState } from '@/metadata-store/states/isAppMetadataReadyState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';

export const IsAppMetadataReadyEffect = () => {
  const isLoggedIn = useIsLogged();
  const currentUser = useRecoilValueV2(currentUserState);
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);
  const objectsEntry = useFamilyRecoilValueV2(metadataStoreState, 'objects');
  const viewsEntry = useFamilyRecoilValueV2(metadataStoreState, 'views');
  const setIsAppMetadataReady = useSetRecoilStateV2(isAppMetadataReadyState);

  useEffect(() => {
    const hasActiveWorkspace = isWorkspaceActiveOrSuspended(currentWorkspace);

    const areObjectsLoaded = objectsEntry.status === 'loaded';
    const areViewsLoaded = viewsEntry.status === 'loaded';

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
    objectsEntry.status,
    viewsEntry.status,
    setIsAppMetadataReady,
  ]);

  return null;
};
