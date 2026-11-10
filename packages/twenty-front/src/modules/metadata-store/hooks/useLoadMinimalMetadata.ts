import { VIEW_FAMILY_ENTITY_KEYS } from '@/metadata-store/constants/ViewFamilyEntityKeys';
import { FIND_MINIMAL_METADATA } from '@/metadata-store/graphql/queries/findMinimalMetadata';
import {
  ALL_METADATA_ENTITY_KEYS,
  metadataStoreState,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { type FlatView } from '@/metadata-store/types/FlatView';
import { viewFamilyHintState } from '@/metadata-store/states/viewFamilyHintState';
import { type FindMinimalMetadataQuery } from '@/metadata-store/types/MinimalMetadata';
import { getViewFamilyHintFromCollectionHashes } from '@/metadata-store/utils/getViewFamilyHintFromCollectionHashes';
import { isViewFamilySplitModeActive } from '@/metadata-store/utils/isViewFamilySplitModeActive';
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

    const isSplitModeActive = isViewFamilySplitModeActive(store);

    if (isSplitModeActive) {
      store.set(
        viewFamilyHintState.atom,
        getViewFamilyHintFromCollectionHashes(collectionHashes),
      );
    }

    const staleEntityKeys: MetadataEntityKey[] = [];

    const entityKeysWithServerHash = new Set<MetadataEntityKey>();

    if (isDefined(collectionHashes)) {
      for (const { collectionName, hash } of collectionHashes) {
        const entityKey = mapAllMetadataNameToEntityKey(collectionName);

        if (!isDefined(entityKey)) {
          continue;
        }

        entityKeysWithServerHash.add(entityKey);

        const entry = store.get(metadataStoreState.atomFamily(entityKey));

        if (entry.currentCollectionHash !== hash) {
          staleEntityKeys.push(entityKey);
        }

        if (isSplitModeActive && VIEW_FAMILY_ENTITY_KEYS.includes(entityKey)) {
          continue;
        }

        store.set(metadataStoreState.atomFamily(entityKey), (prev) => ({
          ...prev,
          draftCollectionHash: hash,
        }));
      }
    }

    for (const entityKey of ALL_METADATA_ENTITY_KEYS) {
      if (
        !entityKeysWithServerHash.has(entityKey) &&
        !staleEntityKeys.includes(entityKey)
      ) {
        staleEntityKeys.push(entityKey);
      }
    }

    // Views cached before ViewFragment selected universalIdentifier keep a
    // matching hash, so they would never be refetched otherwise
    const cachedViews = store.get(metadataStoreState.atomFamily('views'))
      .current as FlatView[];

    if (
      !staleEntityKeys.includes('views') &&
      cachedViews.some((view) => !isDefined(view.universalIdentifier))
    ) {
      staleEntityKeys.push('views');
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
        currentCollectionHash: isSplitModeActive
          ? undefined
          : prev.draftCollectionHash,
        draftCollectionHash: undefined,
      }));
    }

    return { staleEntityKeys };
  }, [client, store]);

  return { loadMinimalMetadata };
};
