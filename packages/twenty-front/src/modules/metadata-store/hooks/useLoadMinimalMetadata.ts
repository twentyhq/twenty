import { VIEW_METADATA_ENTITY_KEYS } from '@/metadata-store/constants/ViewMetadataEntityKeys';
import { FIND_MINIMAL_METADATA } from '@/metadata-store/graphql/queries/findMinimalMetadata';
import { useReplaceViewMetadataSliceDraft } from '@/metadata-store/hooks/useReplaceViewMetadataSliceDraft';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import {
  ALL_METADATA_ENTITY_KEYS,
  metadataStoreState,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';
import { objectViewsHashesState } from '@/metadata-store/states/objectViewsHashesState';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { type FindMinimalMetadataQuery } from '@/metadata-store/types/MinimalMetadata';
import { getViewMetadataSlice } from '@/metadata-store/utils/getViewMetadataSlice';
import { mapAllMetadataNameToEntityKey } from '@/metadata-store/utils/mapAllMetadataNameToEntityKey';
import { mergeMinimalViewsIntoViewMetadataSlice } from '@/metadata-store/utils/mergeMinimalViewsIntoViewMetadataSlice';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

const VIEW_METADATA_ENTITY_KEY_SET = new Set<MetadataEntityKey>(
  VIEW_METADATA_ENTITY_KEYS,
);

export const useLoadMinimalMetadata = () => {
  const client = useApolloClient();
  const store = useStore();
  const { applyChanges } = useUpdateMetadataStoreDraft();
  const { replaceViewMetadataSliceDraft } = useReplaceViewMetadataSliceDraft();

  const loadMinimalMetadata = useCallback(async () => {
    const result = await client.query<FindMinimalMetadataQuery>({
      query: FIND_MINIMAL_METADATA,
      fetchPolicy: 'network-only',
    });

    if (!isDefined(result.data?.minimalMetadata)) {
      return null;
    }

    const { objectMetadataItems, views, objectViewsHashes, collectionHashes } =
      result.data.minimalMetadata;

    const staleEntityKeys: MetadataEntityKey[] = [];

    const entityKeysWithServerHash = new Set<MetadataEntityKey>();

    if (isDefined(collectionHashes)) {
      for (const { collectionName, hash } of collectionHashes) {
        const entityKey = mapAllMetadataNameToEntityKey(collectionName);

        if (
          !isDefined(entityKey) ||
          VIEW_METADATA_ENTITY_KEY_SET.has(entityKey)
        ) {
          continue;
        }

        entityKeysWithServerHash.add(entityKey);

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

    for (const entityKey of ALL_METADATA_ENTITY_KEYS) {
      if (
        !VIEW_METADATA_ENTITY_KEY_SET.has(entityKey) &&
        !entityKeysWithServerHash.has(entityKey) &&
        !staleEntityKeys.includes(entityKey)
      ) {
        staleEntityKeys.push(entityKey);
      }
    }

    // Cached before the fragment selected universalIdentifier, with a matching hash
    const navigationMenuItemsEntry = store.get(
      metadataStoreState.atomFamily('navigationMenuItems'),
    );

    if (
      !staleEntityKeys.includes('navigationMenuItems') &&
      navigationMenuItemsEntry.current.some(
        (navigationMenuItem) =>
          !('universalIdentifier' in navigationMenuItem) ||
          !isDefined(navigationMenuItem.universalIdentifier),
      )
    ) {
      staleEntityKeys.push('navigationMenuItems');
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

    store.set(
      objectViewsHashesState.atom,
      Object.fromEntries(
        objectViewsHashes.map(({ objectMetadataId, hash }) => [
          objectMetadataId,
          hash,
        ]),
      ),
    );

    replaceViewMetadataSliceDraft(
      mergeMinimalViewsIntoViewMetadataSlice({
        minimalViews: views,
        currentSlice: getViewMetadataSlice(store),
        loadedViewHashByObjectMetadataId: store.get(
          metadataStoreState.atomFamily('views'),
        ).loadedViewHashByObjectMetadataId,
      }),
    );

    applyChanges();

    return { staleEntityKeys };
  }, [client, store, applyChanges, replaceViewMetadataSliceDraft]);

  return { loadMinimalMetadata };
};
