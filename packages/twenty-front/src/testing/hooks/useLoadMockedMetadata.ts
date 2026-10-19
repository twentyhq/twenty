import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import {
  preloadMockedMetadata,
  type PreloadedMockedMetadata,
} from '~/testing/utils/preloadMockedMetadata';
import { setTestApplicationsInMetadataStore } from '~/testing/utils/setTestApplicationsInMetadataStore';

const MOCKED_COLLECTION_HASH = 'mocked';

export const useLoadMockedMetadata = () => {
  const store = useStore();
  const { replaceDraft, applyChanges, resetMetadataStore } =
    useUpdateMetadataStoreDraft();

  const applyMockedMetadata = useCallback(
    (data: PreloadedMockedMetadata) => {
      resetMetadataStore();

      replaceDraft(
        'objectMetadataItems',
        data.flatObjects,
        MOCKED_COLLECTION_HASH,
      );
      replaceDraft(
        'fieldMetadataItems',
        data.flatFields,
        MOCKED_COLLECTION_HASH,
      );
      replaceDraft(
        'indexMetadataItems',
        data.flatIndexes,
        MOCKED_COLLECTION_HASH,
      );
      replaceDraft('views', data.flatViews, MOCKED_COLLECTION_HASH);
      replaceDraft('viewFields', data.flatViewFields, MOCKED_COLLECTION_HASH);
      replaceDraft('viewFilters', data.flatViewFilters, MOCKED_COLLECTION_HASH);
      replaceDraft('viewSorts', data.flatViewSorts, MOCKED_COLLECTION_HASH);
      replaceDraft('viewGroups', data.flatViewGroups, MOCKED_COLLECTION_HASH);
      replaceDraft(
        'viewFilterGroups',
        data.flatViewFilterGroups,
        MOCKED_COLLECTION_HASH,
      );
      replaceDraft(
        'viewFieldGroups',
        data.flatViewFieldGroups,
        MOCKED_COLLECTION_HASH,
      );
      replaceDraft(
        'navigationMenuItems',
        data.navigationMenuItems,
        MOCKED_COLLECTION_HASH,
      );

      applyChanges();
    },
    [replaceDraft, applyChanges, resetMetadataStore],
  );

  const isAlreadyMocked = useCallback(() => {
    const entry = store.get(
      metadataStoreState.atomFamily('objectMetadataItems'),
    );

    return (
      entry.status === 'up-to-date' &&
      entry.currentCollectionHash === MOCKED_COLLECTION_HASH
    );
  }, [store]);

  const syncApplicationsWithCurrentWorkspace = useCallback(() => {
    const installedApplications =
      store.get(currentWorkspaceState.atom)?.installedApplications ?? [];

    setTestApplicationsInMetadataStore(
      store,
      installedApplications.map(({ id, universalIdentifier, name }) => ({
        id,
        universalIdentifier,
        name,
      })),
    );
  }, [store]);

  const loadMockedMetadataAtomic = useCallback(async () => {
    if (!isAlreadyMocked()) {
      const data = await preloadMockedMetadata();
      applyMockedMetadata(data);
    }

    syncApplicationsWithCurrentWorkspace();
  }, [
    applyMockedMetadata,
    isAlreadyMocked,
    syncApplicationsWithCurrentWorkspace,
  ]);

  return { applyMockedMetadata, loadMockedMetadataAtomic };
};
