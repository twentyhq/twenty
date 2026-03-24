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
      // noop
    }
  }
};

export const clearSessionLocalStorageKeys = () => {
  safeRemoveItems(SESSION_KEYS_TO_CLEAR);
};

export const clearAllSessionLocalStorageKeys = () => {
  safeRemoveItems([...getMetadataStoreKeys(), ...SESSION_KEYS_TO_CLEAR]);
};
