import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItem';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const ObjectMetadataItemsLoadEffect = () => {
  const currentUser = useRecoilValue(currentUserState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();
  const { loadMockedObjectMetadataItems } = useLoadMockedObjectMetadataItems();

  useEffect(() => {
    if (
      isUndefinedOrNull(currentUser) ||
      !isWorkspaceActiveOrSuspended(currentWorkspace)
    ) {
      loadMockedObjectMetadataItems();
    } else {
      refreshObjectMetadataItems();
    }
  }, [
    currentUser,
    currentWorkspace,
    loadMockedObjectMetadataItems,
    refreshObjectMetadataItems,
  ]);

  return <></>;
};
