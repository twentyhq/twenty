import { useMetadataStore } from '@/app/hooks/useMetadataStore';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useStore } from 'jotai';
import { useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';

export const ObjectMetadataProviderEffect = () => {
  const isLoggedIn = useIsLogged();
  const currentUser = useRecoilValueV2(currentUserState);
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);
  const store = useStore();

  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();
  const { loadMockedObjectMetadataItems } = useLoadMockedObjectMetadataItems();
  const { updateDraft, applyChanges } = useMetadataStore();

  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (isLoggedIn && !isDefined(currentUser)) {
      return;
    }

    if (isLoadingRef.current) {
      return;
    }

    const shouldLoadReal =
      isLoggedIn && isWorkspaceActiveOrSuspended(currentWorkspace);

    isLoadingRef.current = true;

    const loadObjectMetadata = async () => {
      try {
        if (!shouldLoadReal) {
          await loadMockedObjectMetadataItems();
        } else {
          await refreshObjectMetadataItems();
        }

        const loadedItems = store.get(objectMetadataItemsState.atom);
        updateDraft('objects', loadedItems);
        applyChanges();
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadObjectMetadata();
  }, [
    currentUser,
    currentWorkspace,
    isLoggedIn,
    loadMockedObjectMetadataItems,
    refreshObjectMetadataItems,
    store,
    updateDraft,
    applyChanges,
  ]);

  return null;
};
