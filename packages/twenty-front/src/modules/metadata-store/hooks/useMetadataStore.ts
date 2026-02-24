import {
  ALL_METADATA_KEYS,
  metadataStoreState,
  type MetadataKey,
  type MetadataLoadEntry,
} from '@/metadata-store/states/metadataStoreState';
import { isAppMetadataReadyState } from '@/metadata-store/states/isAppMetadataReadyState';
import { type createStore, useStore } from 'jotai';
import { useCallback } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type JotaiStore = ReturnType<typeof createStore>;

const EMPTY_ENTRY: MetadataLoadEntry = {
  current: [],
  draft: [],
  status: 'empty',
};

const areViewsConsistentWithObjects = (
  viewsDraft: object[],
  objectsCurrent: object[],
): boolean => {
  const objectIds = new Set(
    objectsCurrent.map((item) => (item as { id: string }).id),
  );

  return viewsDraft.every((view) =>
    objectIds.has((view as { objectMetadataId: string }).objectMetadataId),
  );
};

export const resetMetadataStore = (store: JotaiStore) => {
  for (const key of ALL_METADATA_KEYS) {
    store.set(metadataStoreState.atomFamily(key), EMPTY_ENTRY);
  }

  store.set(isAppMetadataReadyState.atom, false);
};

const promoteEntry = (store: JotaiStore, key: MetadataKey) => {
  const entry = store.get(metadataStoreState.atomFamily(key));

  store.set(metadataStoreState.atomFamily(key), {
    current: entry.draft,
    draft: [],
    status: 'loaded',
  });
};

export const useMetadataStore = () => {
  const store = useStore();

  const updateDraft = useCallback(
    (key: MetadataKey, data: object[]) => {
      const currentEntry = store.get(metadataStoreState.atomFamily(key));

      if (
        currentEntry.status === 'loaded' &&
        isDeeplyEqual(currentEntry.current, data)
      ) {
        return;
      }

      store.set(metadataStoreState.atomFamily(key), (prev) => ({
        ...prev,
        draft: data,
        status: 'draft_pending' as const,
      }));
    },
    [store],
  );

  const applyChanges = useCallback((): boolean => {
    let promoted = false;

    for (const key of ALL_METADATA_KEYS) {
      if (key === 'views') {
        continue;
      }

      const entry = store.get(metadataStoreState.atomFamily(key));

      if (entry.status === 'draft_pending') {
        promoteEntry(store, key);
        promoted = true;
      }
    }

    const viewsEntry = store.get(metadataStoreState.atomFamily('views'));

    if (viewsEntry.status === 'draft_pending') {
      const objectsEntry = store.get(metadataStoreState.atomFamily('objects'));

      if (
        areViewsConsistentWithObjects(viewsEntry.draft, objectsEntry.current)
      ) {
        promoteEntry(store, 'views');
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
