import { VIEW_METADATA_ENTITY_KEYS } from '@/metadata-store/constants/ViewMetadataEntityKeys';
import { FIND_MINIMAL_METADATA } from '@/metadata-store/graphql/queries/findMinimalMetadata';
import { useReplaceViewsDraft } from '@/metadata-store/hooks/useReplaceViewsDraft';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { loadedViewsObjectMetadataIdsState } from '@/metadata-store/states/loadedViewsObjectMetadataIdsState';
import {
  ALL_METADATA_ENTITY_KEYS,
  metadataStoreState,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { type FindMinimalMetadataQuery } from '@/metadata-store/types/MinimalMetadata';
import { getDraftOrCurrentMetadataItems } from '@/metadata-store/utils/getDraftOrCurrentMetadataItems';
import { mergeMinimalViewsWithCachedViews } from '@/metadata-store/utils/mergeMinimalViewsWithCachedViews';
import { mapAllMetadataNameToEntityKey } from '@/metadata-store/utils/mapAllMetadataNameToEntityKey';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useLoadMinimalMetadata = () => {
  const client = useApolloClient();
  const store = useStore();
  const { applyChanges } = useUpdateMetadataStoreDraft();
  const { replaceViewsDraft } = useReplaceViewsDraft();

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

    const areViewsStale =
      store.get(metadataStoreState.atomFamily('views')).status === 'empty' ||
      VIEW_METADATA_ENTITY_KEYS.some((viewEntityKey) =>
        staleEntityKeys.includes(viewEntityKey),
      );

    if (areViewsStale) {
      const mergedViews = mergeMinimalViewsWithCachedViews({
        minimalViews: views,
        cachedViews: getDraftOrCurrentMetadataItems({
          store,
          metadataEntityKey: 'views',
        }),
      });

      replaceViewsDraft({
        views: mergedViews,
        viewIdsKeepingChildren: new Set(mergedViews.map((view) => view.id)),
      });

      applyChanges();

      store.set(loadedViewsObjectMetadataIdsState.atom, []);
    }

    return { staleEntityKeys };
  }, [client, store, applyChanges, replaceViewsDraft]);

  return { loadMinimalMetadata };
};
