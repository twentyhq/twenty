import { FIND_PRESENTATION_METADATA } from '@/metadata-store/graphql/queries/findPresentationMetadata';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { metadataVersionState } from '@/metadata-store/states/metadataVersionState';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { type FlatView } from '@/metadata-store/types/FlatView';
import { type FindPresentationMetadataQuery } from '@/metadata-store/types/PresentationMetadata';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useFetchPresentationMetadata = () => {
  const client = useApolloClient();
  const store = useStore();

  const fetchPresentationMetadata = useCallback(async () => {
    const result = await client.query<FindPresentationMetadataQuery>({
      query: FIND_PRESENTATION_METADATA,
      fetchPolicy: 'network-only',
    });

    if (!isDefined(result.data?.presentationMetadata)) {
      return null;
    }

    const { objectMetadataItems, views, metadataVersion } =
      result.data.presentationMetadata;

    const localMetadataVersion = store.get(metadataVersionState.atom);

    // Skip hydration if data already loaded with same or newer version
    if (
      isDefined(localMetadataVersion) &&
      localMetadataVersion >= metadataVersion
    ) {
      return { metadataVersion, isStale: false };
    }

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

    store.set(metadataVersionState.atom, metadataVersion);

    const isStale =
      isDefined(localMetadataVersion) && localMetadataVersion < metadataVersion;

    return { metadataVersion, isStale };
  }, [client, store]);

  return { fetchPresentationMetadata };
};
