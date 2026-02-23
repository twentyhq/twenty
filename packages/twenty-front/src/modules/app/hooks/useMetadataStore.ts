import {
  ALL_METADATA_KEYS,
  metadataStoreState,
  type MetadataKey,
  type MetadataLoadEntry,
} from '@/app/states/metadataStoreState';
import { isAppLoadingState } from '@/app/states/isAppLoadingState';
import { createStore, useStore } from 'jotai';

type JotaiStore = ReturnType<typeof createStore>;
import { useCallback } from 'react';

const EMPTY_ENTRY: MetadataLoadEntry = {
  current: [],
  draft: [],
  status: 'empty',
};

const PAIRED_KEYS: MetadataKey[] = ['objects', 'views'];

const INDEPENDENT_KEYS: MetadataKey[] = ALL_METADATA_KEYS.filter(
  (key) => !PAIRED_KEYS.includes(key),
);

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

const promoteEntry = (store: JotaiStore, key: MetadataKey) => {
  const entry = store.get(metadataStoreState.atomFamily(key));

  store.set(metadataStoreState.atomFamily(key), {
    current: entry.draft,
    draft: [],
    status: 'loaded',
  });
};

export const resetMetadataStore = (store: JotaiStore) => {
  for (const key of ALL_METADATA_KEYS) {
    store.set(metadataStoreState.atomFamily(key), EMPTY_ENTRY);
  }

  store.set(isAppLoadingState.atom, true);
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

  // Objects and views are a paired gate: they must both be draft_pending
  // and consistent before either is promoted. Other keys promote independently.
  // Returns true if at least one entry was promoted.
  const applyChanges = useCallback((): boolean => {
    const objectsEntry = store.get(metadataStoreState.atomFamily('objects'));
    const viewsEntry = store.get(metadataStoreState.atomFamily('views'));

    let promoted = false;

    if (
      objectsEntry.status === 'draft_pending' &&
      viewsEntry.status === 'draft_pending'
    ) {
      if (!areDraftsConsistent(objectsEntry.draft, viewsEntry.draft)) {
        store.set(metadataStoreState.atomFamily('objects'), EMPTY_ENTRY);
        store.set(metadataStoreState.atomFamily('views'), EMPTY_ENTRY);
        return false;
      }

      promoteEntry(store, 'objects');
      promoteEntry(store, 'views');
      promoted = true;
    }

    for (const key of INDEPENDENT_KEYS) {
      const entry = store.get(metadataStoreState.atomFamily(key));

      if (entry.status === 'draft_pending') {
        promoteEntry(store, key);
        promoted = true;
      }
    }

    return promoted;
  }, [store]);

  const reset = useCallback(() => {
    resetMetadataStore(store);
  }, [store]);

  return { updateDraft, applyChanges, resetMetadataStore: reset };
};
