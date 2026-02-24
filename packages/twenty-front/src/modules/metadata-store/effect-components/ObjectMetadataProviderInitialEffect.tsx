import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useStore } from 'jotai';
import { useEffect, useState } from 'react';
import { isWorkspaceActiveOrSuspended } from 'twenty-shared/workspace';

export const ObjectMetadataProviderInitialEffect = () => {
  const isCurrentUserLoaded = useRecoilValueV2(isCurrentUserLoadedState);
  const currentWorkspace = useRecoilValueV2(currentWorkspaceState);
  const store = useStore();
  const [isInitialized, setIsInitialized] = useState(false);

  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();
  const { loadMockedObjectMetadataItems } = useLoadMockedObjectMetadataItems();
  const { updateDraft, applyChanges } = useMetadataStore();

  useEffect(() => {
    if (isInitialized) {
      console.log('[ObjectMetadata] effect: already initialized, skipping');
      return;
    }
    if (!isCurrentUserLoaded) {
      console.log(
        '[ObjectMetadata] effect: waiting for current user to load',
      );
      return;
    }

    const shouldLoadReal = isWorkspaceActiveOrSuspended(currentWorkspace);
    console.log('[ObjectMetadata] effect: loading metadata', {
      shouldLoadReal,
      workspaceActivationStatus: currentWorkspace?.activationStatus,
    });

    const loadObjectMetadata = async () => {
      if (shouldLoadReal) {
        await refreshObjectMetadataItems();
      } else {
        console.log('[ObjectMetadata] effect: loading mocked metadata');
        await loadMockedObjectMetadataItems();
      }

      const loadedItems = store.get(objectMetadataItemsState.atom);
      console.log('[ObjectMetadata] effect: loaded', {
        itemCount: loadedItems.length,
      });
      updateDraft('objects', loadedItems);
      applyChanges();
      setIsInitialized(true);
    };

    loadObjectMetadata();
  }, [
    isInitialized,
    isCurrentUserLoaded,
    currentWorkspace,
    refreshObjectMetadataItems,
    loadMockedObjectMetadataItems,
    store,
    updateDraft,
    applyChanges,
  ]);

  return null;
};
