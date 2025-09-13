import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const ObjectMetadataItemsLoadEffect = () => {
  const currentUser = useRecoilValue(currentUserState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
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
