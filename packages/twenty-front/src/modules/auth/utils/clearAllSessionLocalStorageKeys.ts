import { safeRemoveLocalStorageItems } from '@/auth/utils/safeRemoveLocalStorageItems';
import {
  ALL_METADATA_ENTITY_KEYS,
  clearMetadataStoreStorage,
  METADATA_STORE_KEY_PREFIX,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';
import { clearSessionLocalStorageKeys } from './clearSessionLocalStorageKeys';

const getMetadataStoreKeys = (): string[] =>
  ALL_METADATA_ENTITY_KEYS.map(
    (key: MetadataEntityKey) => `${METADATA_STORE_KEY_PREFIX}${key}`,
  );

export const clearAllSessionLocalStorageKeys = () => {
  clearSessionLocalStorageKeys();
  // The metadata cache now lives in IndexedDB; clear it too, plus any legacy
  // localStorage snapshot that predates the migration.
  void clearMetadataStoreStorage();
  safeRemoveLocalStorageItems(getMetadataStoreKeys());
};
