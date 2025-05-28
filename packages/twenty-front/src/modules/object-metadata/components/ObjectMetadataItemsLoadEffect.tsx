import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItem';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const ObjectMetadataItemsLoadEffect = () => {
  const currentUser = useRecoilValue(currentUserState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();
  const { loadMockedObjectMetadataItems } = useLoadMockedObjectMetadataItems();

  const [metadataFetchStarted, setMetadataFetchStarted] = useState(false);

  const isUserWorkspaceValid =
    !isUndefinedOrNull(currentUser) &&
    isWorkspaceActiveOrSuspended(currentWorkspace);

  const startMetadataFetch = useCallback(() => {
    if (!metadataFetchStarted) {
      setMetadataFetchStarted(true);
      refreshObjectMetadataItems();
    }
  }, [metadataFetchStarted, refreshObjectMetadataItems]);

  useEffect(() => {
    startMetadataFetch();

    if (!isUserWorkspaceValid) {
      loadMockedObjectMetadataItems();
    }
  }, [
    currentUser,
    currentWorkspace,
    isUserWorkspaceValid,
    loadMockedObjectMetadataItems,
    startMetadataFetch,
  ]);

  return <></>;
};
