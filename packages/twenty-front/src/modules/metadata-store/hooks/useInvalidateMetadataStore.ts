import { metadataLoadedVersionState } from '@/metadata-store/states/metadataLoadedVersionState';
import {
  ALL_METADATA_ENTITY_KEYS,
  metadataStoreState,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useInvalidateMetadataStore = () => {
  const store = useStore();

  const invalidateMetadataStore = useCallback(
    (
      metadataEntityKeys: readonly MetadataEntityKey[] = ALL_METADATA_ENTITY_KEYS,
    ) => {
      for (const key of metadataEntityKeys) {
        store.set(metadataStoreState.atomFamily(key), (prev) => ({
          ...prev,
          currentCollectionHash: undefined,
        }));
      }
      store.set(metadataLoadedVersionState.atom, (prev) => prev + 1);
    },
    [store],
  );

  return { invalidateMetadataStore };
};
