import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { splitCompositeObjectMetadata } from '@/metadata-store/utils/splitCompositeObjectMetadata';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '@/object-metadata/utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';
import { type FetchPolicy } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type ObjectMetadataItemsQuery } from '~/generated-metadata/graphql';

export const useRefreshObjectMetadataItems = (
  fetchPolicy: FetchPolicy = 'network-only',
) => {
  const store = useStore();
  const client = useApolloClient();
  const { updateDraft, applyChanges } = useMetadataStore();

  const refreshObjectMetadataItems = useCallback(async () => {
    const objectMetadataItemsResult =
      await client.query<ObjectMetadataItemsQuery>({
        query: FIND_MANY_OBJECT_METADATA_ITEMS,
        variables: {},
        fetchPolicy,
      });

    const compositeObjects =
      mapPaginatedObjectMetadataItemsToObjectMetadataItems({
        pagedObjectMetadataItems: objectMetadataItemsResult.data,
      });

    const { flatObjects, flatFields, flatIndexes } =
      splitCompositeObjectMetadata(compositeObjects);

    updateDraft('objectMetadataItems', flatObjects);
    updateDraft('fieldMetadataItems', flatFields);
    updateDraft('indexMetadataItems', flatIndexes);
    applyChanges();

    if (store.get(isAppEffectRedirectEnabledState.atom) === false) {
      store.set(isAppEffectRedirectEnabledState.atom, true);
    }
  }, [client, fetchPolicy, store, updateDraft, applyChanges]);

  return {
    refreshObjectMetadataItems,
  };
};
