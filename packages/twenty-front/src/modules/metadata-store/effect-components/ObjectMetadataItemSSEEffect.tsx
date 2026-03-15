import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { patchMetadataStoreFromSSEEvent } from '@/metadata-store/utils/patchMetadataStoreFromSSEEvent';
import { navigationMenuItemsState } from '@/navigation-menu-item/states/navigationMenuItemsState';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useStore } from 'jotai';
import { useApolloClient } from '@apollo/client/react';
import {
  AllMetadataName,
  FindManyNavigationMenuItemsDocument,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const ObjectMetadataItemSSEEffect = () => {
  const queryId = 'object-metadata-sse-effect';

  const store = useStore();
  const client = useApolloClient();

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      metadataName: AllMetadataName.objectMetadata,
      variables: {},
    },
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.objectMetadata,
    onMetadataOperationBrowserEvent: async (eventDetail) => {
      patchMetadataStoreFromSSEEvent(
        store,
        'objectMetadataItems',
        eventDetail.operation,
        eventDetail.updatedCollectionHash,
      );

      const navigationMenuItemsResult = await client.query({
        query: FindManyNavigationMenuItemsDocument,
        fetchPolicy: 'network-only',
      });

      const existingNavigationMenuItems = store.get(
        navigationMenuItemsState.atom,
      );

      if (
        !isDeeplyEqual(
          existingNavigationMenuItems,
          navigationMenuItemsResult.data?.navigationMenuItems,
        )
      ) {
        store.set(
          navigationMenuItemsState.atom,
          navigationMenuItemsResult.data?.navigationMenuItems ?? [],
        );
      }
    },
  });

  return null;
};
