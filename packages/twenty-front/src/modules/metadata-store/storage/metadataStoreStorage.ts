import { type MetadataStoreItem } from '@/metadata-store/states/metadataStoreState';
import { createIndexedDbBackedJotaiStorage } from '@/ui/utilities/state/jotai/utils/createIndexedDbBackedJotaiStorage';

// Older snapshots can have a current hash despite missing their morph field.
export const {
  storage: metadataStoreStorage,
  hydrate: hydrateMetadataStore,
  clear: clearMetadataStoreStorage,
} = createIndexedDbBackedJotaiStorage<MetadataStoreItem>('metadata-store-v2');
