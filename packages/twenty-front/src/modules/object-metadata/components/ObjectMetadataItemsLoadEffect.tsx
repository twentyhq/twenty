import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useEffect, useState } from 'react';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const ObjectMetadataItemsLoadEffect = () => {
  const currentUser = useRecoilValueV2(currentUserState);
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);
  const [isInitialized, setIsInitialized] = useState(false);

  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();
  const { loadMockedObjectMetadataItems } = useLoadMockedObjectMetadataItems();

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    const loadObjectMetadata = async () => {
      if (
        isUndefinedOrNull(currentUser) ||
        !isWorkspaceActiveOrSuspended(currentWorkspace)
      ) {
        await loadMockedObjectMetadataItems();
      } else {
        await refreshObjectMetadataItems();
      }
      setIsInitialized(true);
    };

    loadObjectMetadata();
  }, [
    currentUser,
    currentWorkspace,
    loadMockedObjectMetadataItems,
    refreshObjectMetadataItems,
    isInitialized,
  ]);

  return <></>;
};
