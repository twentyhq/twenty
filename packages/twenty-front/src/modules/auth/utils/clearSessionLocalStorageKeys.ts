import {
  ALL_METADATA_ENTITY_KEYS,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';

const METADATA_STORE_PREFIX = 'metadataStoreState__';

const SESSION_KEYS_TO_CLEAR = [
  'lastVisitedObjectMetadataItemIdState',
  'lastVisitedViewPerObjectMetadataItemState',
  'playgroundApiKeyState',
  'ai/agentChatDraftsByThreadIdState',
  'locale',
];

const getMetadataStoreKeys = (): string[] =>
  ALL_METADATA_ENTITY_KEYS.map(
    (key: MetadataEntityKey) => `${METADATA_STORE_PREFIX}${key}`,
  );

const safeRemoveItems = (keys: string[]) => {
  for (const key of keys) {
    try {
      localStorage.removeItem(key);
    } catch {
      // localStorage may be unavailable in some environments
    }
  }
};

// Clears non-metadata session keys only. Metadata keys are NOT deleted
// so that other browser tabs (sharing localStorage) keep working.
// The caller is expected to overwrite metadata via applyMockedMetadata()
// which writes mocked data back to localStorage through atomWithStorage.
export const clearSessionLocalStorageKeys = () => {
  safeRemoveItems(SESSION_KEYS_TO_CLEAR);
};

// Clears everything including metadata keys. Use only when creating
// a brand-new Jotai store (resetJotaiStore) where stale localStorage
// values must not be hydrated into the new store.
export const clearAllSessionLocalStorageKeys = () => {
  safeRemoveItems([...getMetadataStoreKeys(), ...SESSION_KEYS_TO_CLEAR]);
};
