import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const ObjectMetadataItemsLoadEffect = () => {
  const currentUser = useRecoilValue(currentUserState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();
  const { loadMockedObjectMetadataItems } = useLoadMockedObjectMetadataItems();

  useEffect(() => {
    if (objectMetadataItems.length > 0) {
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
    };

    loadObjectMetadata();
  }, [
    currentUser,
    currentWorkspace,
    objectMetadataItems.length,
    loadMockedObjectMetadataItems,
    refreshObjectMetadataItems,
  ]);

  return <></>;
};
