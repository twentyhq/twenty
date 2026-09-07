import { type MetadataStoreItem } from '@/metadata-store/states/metadataStoreState';
import { createIndexedDbBackedJotaiStorage } from '@/ui/utilities/state/jotai/utils/createIndexedDbBackedJotaiStorage';

const METADATA_STORE_STORAGE_VERSION = 2;

export const {
  storage: metadataStoreStorage,
  hydrate: hydrateMetadataStore,
  clear: clearMetadataStoreStorage,
} = createIndexedDbBackedJotaiStorage<MetadataStoreItem>('metadata-store', {
  version: METADATA_STORE_STORAGE_VERSION,
});
