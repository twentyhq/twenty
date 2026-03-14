import { metadataCollectionHashesState } from '@/metadata-store/states/metadataCollectionHashesState';
import {
  ALL_METADATA_ENTITY_KEYS,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';

// Returns the list of MetadataEntityKey whose local collection hash
// is missing or differs from the last known server collection hash.
export const useStaleMetadataEntities = (): MetadataEntityKey[] => {
  const collectionHashes = useAtomStateValue(metadataCollectionHashesState);

  return useMemo(() => {
    const staleKeys: MetadataEntityKey[] = [];

    for (const entityKey of ALL_METADATA_ENTITY_KEYS) {
      if (collectionHashes[entityKey] === undefined) {
        staleKeys.push(entityKey);
      }
    }

    return staleKeys;
  }, [collectionHashes]);
};
