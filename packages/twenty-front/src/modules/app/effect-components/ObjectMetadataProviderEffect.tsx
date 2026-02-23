import { useMetadataStore } from '@/app/hooks/useMetadataStore';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useStore } from 'jotai';
import { useEffect } from 'react';
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

  useEffect(() => {
    if (isLoggedIn && !isDefined(currentUser)) {
      return;
    }

    let cancelled = false;

    const shouldLoadReal =
      isLoggedIn && isWorkspaceActiveOrSuspended(currentWorkspace);

    const loadObjectMetadata = async () => {
      if (!shouldLoadReal) {
        await loadMockedObjectMetadataItems();
      } else {
        await refreshObjectMetadataItems();
      }

      if (cancelled) {
        return;
      }

      const loadedItems = store.get(objectMetadataItemsState.atom);
      updateDraft('objects', loadedItems);
      applyChanges();
    };

    loadObjectMetadata();

    return () => {
      cancelled = true;
    };
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
