import { METADATA_STORE_STORAGE_KEY } from '@/metadata-store/hooks/useMetadataStore';
import {
  ALL_METADATA_ENTITY_KEYS,
  metadataStoreState,
  type MetadataStoreItem,
} from '@/metadata-store/states/metadataStoreState';
import { metadataVersionState } from '@/metadata-store/states/metadataVersionState';
import { isDefined } from 'twenty-shared/utils';
import { useStore } from 'jotai';
import { useEffect, useState } from 'react';

type PersistedMetadataStore = {
  version: number;
  metadataVersion: number | null;
  entities: Record<string, MetadataStoreItem>;
};

const CURRENT_PERSISTENCE_VERSION = 1;

const writeToLocalStorage = (data: PersistedMetadataStore) => {
  try {
    localStorage.setItem(METADATA_STORE_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be full or unavailable
  }
};

const readFromLocalStorage = (): PersistedMetadataStore | null => {
  try {
    const raw = localStorage.getItem(METADATA_STORE_STORAGE_KEY);

    if (raw === null) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedMetadataStore;

    if (parsed.version !== CURRENT_PERSISTENCE_VERSION) {
      localStorage.removeItem(METADATA_STORE_STORAGE_KEY);

      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const MetadataLocalStorageEffect = () => {
  const store = useStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (hasHydrated) {
      return;
    }

    setHasHydrated(true);

    const persisted = readFromLocalStorage();

    if (persisted === null) {
      return;
    }

    for (const key of ALL_METADATA_ENTITY_KEYS) {
      const persistedEntry = persisted.entities[key];

      if (!isDefined(persistedEntry)) {
        continue;
      }

      const currentEntry = store.get(metadataStoreState.atomFamily(key));

      if (currentEntry.status !== 'empty') {
        continue;
      }

      store.set(metadataStoreState.atomFamily(key), {
        current: persistedEntry.current,
        draft: [],
        status: 'up-to-date',
      });
    }

    if (persisted.metadataVersion !== null) {
      store.set(metadataVersionState.atom, persisted.metadataVersion);
    }
  }, [store, hasHydrated]);

  useEffect(() => {
    const unsubscribes = ALL_METADATA_ENTITY_KEYS.map((key) =>
      store.sub(metadataStoreState.atomFamily(key), () => {
        const entities: Record<string, MetadataStoreItem> = {};
        let hasAnyData = false;

        for (const entityKey of ALL_METADATA_ENTITY_KEYS) {
          const entry = store.get(metadataStoreState.atomFamily(entityKey));

          if (entry.status === 'up-to-date') {
            entities[entityKey] = {
              current: entry.current,
              draft: [],
              status: 'up-to-date',
            };
            hasAnyData = true;
          }
        }

        if (hasAnyData) {
          const currentMetadataVersion = store.get(metadataVersionState.atom);

          writeToLocalStorage({
            version: CURRENT_PERSISTENCE_VERSION,
            metadataVersion: currentMetadataVersion,
            entities,
          });
        }
      }),
    );

    return () => {
      for (const unsubscribe of unsubscribes) {
        unsubscribe();
      }
    };
  }, [store]);

  return null;
};
