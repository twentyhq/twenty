import { safeRemoveLocalStorageItems } from '@/auth/utils/safeRemoveLocalStorageItems';
import {
  ALL_METADATA_ENTITY_KEYS,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';
import { clearSessionLocalStorageKeys } from './clearSessionLocalStorageKeys';

const METADATA_STORE_PREFIX = 'metadataStoreState__';

const getMetadataStoreKeys = (): string[] =>
  ALL_METADATA_ENTITY_KEYS.map(
    (key: MetadataEntityKey) => `${METADATA_STORE_PREFIX}${key}`,
  );

export const clearAllSessionLocalStorageKeys = () => {
  clearSessionLocalStorageKeys();
  safeRemoveLocalStorageItems(getMetadataStoreKeys());
};
