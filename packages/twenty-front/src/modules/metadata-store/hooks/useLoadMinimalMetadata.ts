import { FIND_MINIMAL_METADATA } from '@/metadata-store/graphql/queries/findMinimalMetadata';
import {
  ALL_METADATA_ENTITY_KEYS,
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

    const staleEntityKeys: MetadataEntityKey[] = [];

    if (isDefined(collectionHashes)) {
      for (const { collectionName, hash } of collectionHashes) {
        const entityKey = mapAllMetadataNameToEntityKey(collectionName);

        if (!isDefined(entityKey)) {
          continue;
        }

        const entry = store.get(metadataStoreState.atomFamily(entityKey));

        if (entry.currentCollectionHash !== hash) {
          staleEntityKeys.push(entityKey);
        }

        store.set(metadataStoreState.atomFamily(entityKey), (prev) => ({
          ...prev,
          draftCollectionHash: hash,
        }));
      }
    }

    // OMNIA-CUSTOM: Treat missing hashes as stale when local store is empty.
    // After a Redis flush, the server returns collectionHashes only for cached
    // entities. Entities never fetched server-side (navigationMenuItems, etc.)
    // have no hash, so the frontend never marks them stale — causing them to
    // remain empty forever. This loop detects entity keys absent from the
    // server response that have no local data and marks them for fetching.
    const returnedEntityKeys = new Set(
      (collectionHashes ?? [])
        .map(({ collectionName }) =>
          mapAllMetadataNameToEntityKey(collectionName),
        )
        .filter(isDefined),
    );

    for (const entityKey of ALL_METADATA_ENTITY_KEYS) {
      if (returnedEntityKeys.has(entityKey)) {
        continue;
      }
      const entry = store.get(metadataStoreState.atomFamily(entityKey));

      if (entry.status === 'empty') {
        staleEntityKeys.push(entityKey);
      }
    }

    const objectsEntry = store.get(
      metadataStoreState.atomFamily('objectMetadataItems'),
    );

    if (objectsEntry.status === 'empty') {
      store.set(
        metadataStoreState.atomFamily('objectMetadataItems'),
        (prev) => ({
          ...prev,
          current: objectMetadataItems as unknown as FlatObjectMetadataItem[],
          status: 'up-to-date',
          currentCollectionHash: prev.draftCollectionHash,
          draftCollectionHash: undefined,
        }),
      );
    }

    const viewsEntry = store.get(metadataStoreState.atomFamily('views'));

    if (viewsEntry.status === 'empty') {
      store.set(metadataStoreState.atomFamily('views'), (prev) => ({
        ...prev,
        current: views as unknown as FlatView[],
        status: 'up-to-date',
        currentCollectionHash: prev.draftCollectionHash,
        draftCollectionHash: undefined,
      }));
    }

    return { staleEntityKeys };
  }, [client, store]);

  return { loadMinimalMetadata };
};
