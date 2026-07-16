import { metadataLoadedVersionState } from '@/metadata-store/states/metadataLoadedVersionState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

// Re-runs the minimal metadata load without clearing collection hashes, so the
// hash comparison only refetches collections that actually changed. Unlike
// useInvalidateMetadataStore, this does not force a full refetch of every collection.
export const useResyncMetadataStore = () => {
  const store = useStore();

  const resyncMetadataStore = useCallback(() => {
    store.set(metadataLoadedVersionState.atom, (prev) => prev + 1);
  }, [store]);

  return { resyncMetadataStore };
};
