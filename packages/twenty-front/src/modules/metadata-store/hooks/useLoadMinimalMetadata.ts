import { FIND_MINIMAL_METADATA } from '@/metadata-store/graphql/queries/findMinimalMetadata';
import { metadataCollectionHashesState } from '@/metadata-store/states/metadataCollectionHashesState';
import {
  metadataStoreState,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { type FlatView } from '@/metadata-store/types/FlatView';
import { type FindMinimalMetadataQuery } from '@/metadata-store/types/MinimalMetadata';
import { mapAllMetadataNameToEntityKey } from '@/metadata-store/utils/mapAllMetadataNameToEntityKey';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useLoadMinimalMetadata = () => {
  const client = useApolloClient();
  const store = useStore();

  const loadMinimalMetadata = useCallback(async () => {
    const result = await client.query<FindMinimalMetadataQuery>({
      query: FIND_MINIMAL_METADATA,
      fetchPolicy: 'network-only',
    });

    if (!isDefined(result.data?.minimalMetadata)) {
      return null;
    }

    const { objectMetadataItems, views, collectionHashes } =
      result.data.minimalMetadata;

    const localHashes = store.get(metadataCollectionHashesState.atom);

    const serverHashes: Partial<Record<MetadataEntityKey, string>> = {};

    if (isDefined(collectionHashes)) {
      for (const [metadataName, hash] of Object.entries(
        collectionHashes as Record<string, string>,
      )) {
        const entityKey = mapAllMetadataNameToEntityKey(metadataName);

        if (isDefined(entityKey)) {
          serverHashes[entityKey] = hash;
        }
      }
    }

    store.set(metadataCollectionHashesState.atom, serverHashes);

    const staleEntityKeys: MetadataEntityKey[] = Object.entries(serverHashes)
      .filter(
        ([entityKey, hash]) =>
          localHashes[entityKey as MetadataEntityKey] !== hash,
      )
      .map(([entityKey]) => entityKey as MetadataEntityKey);

    const objectsEntry = store.get(
      metadataStoreState.atomFamily('objectMetadataItems'),
    );

    if (objectsEntry.status === 'empty') {
      store.set(metadataStoreState.atomFamily('objectMetadataItems'), {
        current: objectMetadataItems as unknown as FlatObjectMetadataItem[],
        draft: [],
        status: 'up-to-date',
      });
    }

    const viewsEntry = store.get(metadataStoreState.atomFamily('views'));

    if (viewsEntry.status === 'empty') {
      store.set(metadataStoreState.atomFamily('views'), {
        current: views as unknown as FlatView[],
        draft: [],
        status: 'up-to-date',
      });
    }

    return { staleEntityKeys };
  }, [client, store]);

  return { loadMinimalMetadata };
};
