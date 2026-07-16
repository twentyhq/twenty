import { metadataLoadedVersionState } from '@/metadata-store/states/metadataLoadedVersionState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useResyncMetadataStore = () => {
  const store = useStore();

  const resyncMetadataStore = useCallback(() => {
    store.set(metadataLoadedVersionState.atom, (prev) => prev + 1);
  }, [store]);

  return { resyncMetadataStore };
};
