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
  void clearMetadataStoreStorage();
  safeRemoveLocalStorageItems(getMetadataStoreKeys());
};
