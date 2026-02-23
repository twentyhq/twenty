import { useMetadataStore } from '@/app/hooks/useMetadataStore';
import { metadataStoreState } from '@/app/states/metadataStoreState';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
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

  const objectsEntry = useFamilyRecoilValueV2(metadataStoreState, 'objects');

  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();
  const { loadMockedObjectMetadataItems } = useLoadMockedObjectMetadataItems();
  const { updateDraft, applyChanges } = useMetadataStore();

  useEffect(() => {
    if (objectsEntry.status !== 'empty') {
      return;
    }

    if (isLoggedIn && !isDefined(currentUser)) {
      return;
    }

    const loadObjectMetadata = async () => {
      if (!isLoggedIn || !isWorkspaceActiveOrSuspended(currentWorkspace)) {
        await loadMockedObjectMetadataItems();
      } else {
        await refreshObjectMetadataItems();
      }

      const loadedItems = store.get(objectMetadataItemsState.atom);
      updateDraft('objects', loadedItems);
      applyChanges();
    };

    loadObjectMetadata();
  }, [
    currentUser,
    currentWorkspace,
    isLoggedIn,
    loadMockedObjectMetadataItems,
    objectsEntry.status,
    refreshObjectMetadataItems,
    store,
    updateDraft,
    applyChanges,
  ]);

  return null;
};
