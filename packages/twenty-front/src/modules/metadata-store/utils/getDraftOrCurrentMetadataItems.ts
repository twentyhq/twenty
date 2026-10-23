import {
  metadataStoreState,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';
import { type MetadataEntityTypeMap } from '@/metadata-store/types/MetadataEntityTypeMap';
import { type createStore } from 'jotai';

export const getDraftOrCurrentMetadataItems = <
  TMetadataEntityKey extends MetadataEntityKey,
>({
  store,
  metadataEntityKey,
}: {
  store: ReturnType<typeof createStore>;
  metadataEntityKey: TMetadataEntityKey;
}): MetadataEntityTypeMap[TMetadataEntityKey][] => {
  const entry = store.get(metadataStoreState.atomFamily(metadataEntityKey));

  return (
    entry.status === 'draft-pending' ? entry.draft : entry.current
  ) as MetadataEntityTypeMap[TMetadataEntityKey][];
};
