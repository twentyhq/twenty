import { type MetadataStoreItem } from '@/metadata-store/states/metadataStoreState';
import { createIndexedDbBackedJotaiStorage } from '@/ui/utilities/state/jotai/utils/createIndexedDbBackedJotaiStorage';

export const {
  storage: metadataStoreStorage,
  hydrate: hydrateMetadataStore,
  clear: clearMetadataStoreStorage,
} = createIndexedDbBackedJotaiStorage<MetadataStoreItem>();
