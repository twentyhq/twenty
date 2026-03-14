import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect, useState } from 'react';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';

export const ObjectMetadataProviderInitialEffect = () => {
  const isCurrentUserLoaded = useAtomStateValue(isCurrentUserLoadedState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const [isInitialized, setIsInitialized] = useState(false);

  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();
  const { loadMockedObjectMetadataItems } = useLoadMockedObjectMetadataItems();

  useEffect(() => {
    if (isInitialized) {
      return;
    }
    if (!isCurrentUserLoaded) {
      return;
    }

    const shouldLoadReal = isWorkspaceActiveOrSuspended(currentWorkspace);

    const loadObjectMetadata = async () => {
      if (shouldLoadReal) {
        await refreshObjectMetadataItems();
      } else {
        await loadMockedObjectMetadataItems();
      }

      setIsInitialized(true);
    };

    loadObjectMetadata();
  }, [
    isInitialized,
    isCurrentUserLoaded,
    currentWorkspace,
    refreshObjectMetadataItems,
    loadMockedObjectMetadataItems,
  ]);

  return null;
};
