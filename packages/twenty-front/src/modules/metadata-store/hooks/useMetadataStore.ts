import { isAppMetadataReadyState } from '@/metadata-store/states/isAppMetadataReadyState';
import {
  ALL_METADATA_ENTITY_KEYS,
  metadataStoreState,
  type MetadataEntityKey,
  type MetadataStoreItem,
} from '@/metadata-store/states/metadataStoreState';
import { useStore, type createStore } from 'jotai';
import { useCallback } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type JotaiStore = ReturnType<typeof createStore>;

const EMPTY_ENTRY: MetadataStoreItem = {
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
  for (const key of ALL_METADATA_ENTITY_KEYS) {
    store.set(metadataStoreState.atomFamily(key), EMPTY_ENTRY);
  }

  store.set(isAppMetadataReadyState.atom, false);
};

const changeMetadataEntityAsUpToDate = (
  store: JotaiStore,
  metadataEntityKey: MetadataEntityKey,
) => {
  const entry = store.get(metadataStoreState.atomFamily(metadataEntityKey));

  store.set(metadataStoreState.atomFamily(metadataEntityKey), {
    current: entry.draft,
    draft: [],
    status: 'up-to-date',
  });
};

export const useMetadataStore = () => {
  const store = useStore();

  const updateDraft = useCallback(
    (key: MetadataEntityKey, data: object[]) => {
      const currentEntry = store.get(metadataStoreState.atomFamily(key));

      if (
        currentEntry.status === 'up-to-date' &&
        isDeeplyEqual(currentEntry.current, data)
      ) {
        return;
      }

      store.set(metadataStoreState.atomFamily(key), (prev) => ({
        ...prev,
        draft: data,
        status: 'draft-pending' as const,
      }));
    },
    [store],
  );

  const applyChanges = useCallback((): {
    hasPersistedAnyMetadataEntity: boolean;
  } => {
    let hasPersistedAnyMetadataEntity = false;

    for (const metadataEntityKey of ALL_METADATA_ENTITY_KEYS) {
      if (metadataEntityKey === 'views') {
        continue;
      }

      const metadataStoreEntityEntry = store.get(
        metadataStoreState.atomFamily(metadataEntityKey),
      );

      if (metadataStoreEntityEntry.status === 'draft-pending') {
        changeMetadataEntityAsUpToDate(store, metadataEntityKey);
        hasPersistedAnyMetadataEntity = true;
      }
    }

    const viewsEntry = store.get(metadataStoreState.atomFamily('views'));

    if (viewsEntry.status === 'draft-pending') {
      const objectsEntry = store.get(
        metadataStoreState.atomFamily('objectMetadataItems'),
      );

      if (
        areViewsConsistentWithObjects(viewsEntry.draft, objectsEntry.current)
      ) {
        changeMetadataEntityAsUpToDate(store, 'views');
        hasPersistedAnyMetadataEntity = true;
      }
    }

    return { hasPersistedAnyMetadataEntity };
  }, [store]);

  const reset = useCallback(() => {
    resetMetadataStore(store);
  }, [store]);

  return { updateDraft, applyChanges, resetMetadataStore: reset };
};
