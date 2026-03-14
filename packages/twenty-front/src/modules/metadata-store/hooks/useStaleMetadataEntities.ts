import { metadataCollectionHashesState } from '@/metadata-store/states/metadataCollectionHashesState';
import {
  ALL_METADATA_ENTITY_KEYS,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';

export const useStaleMetadataEntities = (): MetadataEntityKey[] => {
  const metadataCollectionHashes = useAtomStateValue(
    metadataCollectionHashesState,
  );

  return useMemo(() => {
    const staleKeys: MetadataEntityKey[] = [];

    for (const entityKey of ALL_METADATA_ENTITY_KEYS) {
      if (metadataCollectionHashes[entityKey] === undefined) {
        staleKeys.push(entityKey);
      }
    }

    return staleKeys;
  }, [metadataCollectionHashes]);
};
