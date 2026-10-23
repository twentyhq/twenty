import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import {
  ALL_METADATA_ENTITY_KEYS,
  metadataStoreState,
  type MetadataEntityKey,
  type MetadataStoreItem,
} from '@/metadata-store/states/metadataStoreState';
import { type MetadataEntityTypeMap } from '@/metadata-store/types/MetadataEntityTypeMap';
import { CONSISTENCY_VALIDATED_METADATA_ENTITY_KEYS } from '@/metadata-store/constants/ConsistencyValidatedMetadataEntityKeys';
import { getPendingOrCurrentMetadataItems } from '@/metadata-store/utils/getPendingOrCurrentMetadataItems';
import { isPendingMetadataStoreStateConsistent } from '@/metadata-store/utils/isPendingMetadataStoreStateConsistent';
import { useStore, type createStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type JotaiStore = ReturnType<typeof createStore>;

const EMPTY_ENTRY: MetadataStoreItem = {
  current: [],
  draft: [],
  status: 'empty',
};

export const resetMetadataStore = (store: JotaiStore) => {
  for (const key of ALL_METADATA_ENTITY_KEYS) {
    store.set(metadataStoreState.atomFamily(key), EMPTY_ENTRY);
  }

  store.set(isMinimalMetadataReadyState.atom, false);
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
    currentCollectionHash:
      entry.draftCollectionHash ?? entry.currentCollectionHash,
    draftCollectionHash: undefined,
  });
};

export const useUpdateMetadataStoreDraft = () => {
  const store = useStore();

  const replaceDraft = useCallback(
    <K extends MetadataEntityKey>(
      key: K,
      data: MetadataEntityTypeMap[K][],
      collectionHash?: string,
    ) => {
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
        ...(collectionHash !== undefined
          ? { draftCollectionHash: collectionHash }
          : {}),
      }));
    },
    [store],
  );

  const applyChanges = useCallback((): {
    hasPersistedAnyMetadataEntity: boolean;
    isPendingStateConsistent: boolean;
  } => {
    const isPendingStateConsistent =
      isPendingMetadataStoreStateConsistent(store);

    let hasPersistedAnyMetadataEntity = false;

    for (const metadataEntityKey of ALL_METADATA_ENTITY_KEYS) {
      if (
        !isPendingStateConsistent &&
        CONSISTENCY_VALIDATED_METADATA_ENTITY_KEYS.includes(metadataEntityKey)
      ) {
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

    return { hasPersistedAnyMetadataEntity, isPendingStateConsistent };
  }, [store]);

  const addToDraft = useCallback(
    <K extends MetadataEntityKey>({
      key,
      items,
      collectionHash,
    }: {
      key: K;
      items: MetadataEntityTypeMap[K][];
      collectionHash?: string;
    }) => {
      if (items.length === 0) {
        return;
      }

      const entry = store.get(metadataStoreState.atomFamily(key));
      const baseItems: Array<{ id: string }> = getPendingOrCurrentMetadataItems(
        { store, metadataEntityKey: key },
      );

      let newItems = [...baseItems];

      for (const item of items) {
        const newItem = item as unknown as { id: string };
        const existingIndex = newItems.findIndex(
          (existing) => existing.id === newItem.id,
        );

        if (existingIndex >= 0) {
          if (!isDeeplyEqual(newItems[existingIndex], newItem)) {
            newItems[existingIndex] = newItem;
          }
        } else {
          newItems = [...newItems, newItem];
        }
      }

      store.set(metadataStoreState.atomFamily(key), {
        ...entry,
        draft: newItems,
        status: 'draft-pending' as const,
        ...(collectionHash !== undefined
          ? { draftCollectionHash: collectionHash }
          : {}),
      });
    },
    [store],
  );

  const updateInDraft = useCallback(
    <K extends MetadataEntityKey>(
      key: K,
      items: MetadataEntityTypeMap[K][],
      collectionHash?: string,
    ) => {
      if (items.length === 0) {
        return;
      }

      const entry = store.get(metadataStoreState.atomFamily(key));
      const baseItems: Array<{ id: string }> = getPendingOrCurrentMetadataItems(
        { store, metadataEntityKey: key },
      );

      let hasChanged = false;
      const newItems = baseItems.map((existing) => {
        const updatedItem = (items as unknown as Array<{ id: string }>).find(
          (item) => item.id === existing.id,
        );

        if (!isDefined(updatedItem)) {
          return existing;
        }

        const merged = { ...existing, ...updatedItem };

        if (isDeeplyEqual(existing, merged)) {
          return existing;
        }

        hasChanged = true;

        return merged;
      });

      if (!hasChanged && collectionHash === undefined) {
        return;
      }

      store.set(metadataStoreState.atomFamily(key), {
        ...entry,
        draft: hasChanged ? newItems : baseItems,
        status: 'draft-pending' as const,
        ...(collectionHash !== undefined
          ? { draftCollectionHash: collectionHash }
          : {}),
      });
    },
    [store],
  );

  const removeFromDraft = useCallback(
    <K extends MetadataEntityKey>({
      key,
      itemIds,
      collectionHash,
    }: {
      key: K;
      itemIds: string[];
      collectionHash?: string;
    }) => {
      if (itemIds.length === 0) {
        return;
      }

      const entry = store.get(metadataStoreState.atomFamily(key));
      const baseItems: Array<{ id: string }> = getPendingOrCurrentMetadataItems(
        { store, metadataEntityKey: key },
      );

      const idsToDelete = new Set(itemIds);
      const newItems = baseItems.filter(
        (existing) => !idsToDelete.has(existing.id),
      );

      if (
        newItems.length === baseItems.length &&
        collectionHash === undefined
      ) {
        return;
      }

      store.set(metadataStoreState.atomFamily(key), {
        ...entry,
        draft: newItems,
        status: 'draft-pending' as const,
        ...(collectionHash !== undefined
          ? { draftCollectionHash: collectionHash }
          : {}),
      });
    },
    [store],
  );

  const reset = useCallback(() => {
    resetMetadataStore(store);
  }, [store]);

  return {
    replaceDraft,
    applyChanges,
    addToDraft,
    updateInDraft,
    removeFromDraft,
    resetMetadataStore: reset,
  };
};
