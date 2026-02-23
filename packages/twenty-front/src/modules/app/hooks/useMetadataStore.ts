import {
  metadataStoreState,
  type MetadataKey,
  type MetadataLoadEntry,
} from '@/app/states/metadataStoreState';
import { shouldAppBeLoadingState } from '@/object-metadata/states/shouldAppBeLoadingState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

const EMPTY_ENTRY: MetadataLoadEntry = {
  current: [],
  draft: [],
  status: 'empty',
};

// Views reference objects via objectMetadataId — both drafts must agree on IDs.
const areDraftsConsistent = (
  objectsDraft: object[],
  viewsDraft: object[],
): boolean => {
  const objectIds = new Set(
    objectsDraft.map((item) => (item as { id: string }).id),
  );

  return viewsDraft.every((view) =>
    objectIds.has((view as { objectMetadataId: string }).objectMetadataId),
  );
};

export const useMetadataStore = () => {
  const store = useStore();

  const updateDraft = useCallback(
    (key: MetadataKey, data: object[]) => {
      store.set(metadataStoreState.atomFamily(key), (prev) => ({
        ...prev,
        draft: data,
        status: 'draft_pending' as const,
      }));
    },
    [store],
  );

  // Validates consistency then atomically promotes all 'draft_pending' drafts
  // to current. If objects and views are inconsistent (e.g. mocked objects with
  // real views), resets the stale entries back to 'empty' so effects re-fetch.
  const applyChanges = useCallback(() => {
    const objectsEntry = store.get(metadataStoreState.atomFamily('objects'));
    const viewsEntry = store.get(metadataStoreState.atomFamily('views'));

    if (
      objectsEntry.status === 'draft_pending' &&
      viewsEntry.status === 'draft_pending' &&
      !areDraftsConsistent(objectsEntry.draft, viewsEntry.draft)
    ) {
      store.set(metadataStoreState.atomFamily('objects'), EMPTY_ENTRY);
      store.set(metadataStoreState.atomFamily('views'), EMPTY_ENTRY);
      return;
    }

    const allKeys: MetadataKey[] = [
      'objects',
      'views',
      'pageLayouts',
      'logicFunctions',
    ];

    for (const key of allKeys) {
      const entry = store.get(metadataStoreState.atomFamily(key));

      if (entry.status === 'draft_pending') {
        store.set(metadataStoreState.atomFamily(key), {
          current: entry.draft,
          draft: [],
          status: 'loaded',
        });
      }
    }

    store.set(shouldAppBeLoadingState.atom, false);
  }, [store]);

  return { updateDraft, applyChanges };
};
