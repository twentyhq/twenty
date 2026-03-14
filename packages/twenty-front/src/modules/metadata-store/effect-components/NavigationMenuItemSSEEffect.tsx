import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { patchMetadataStoreFromSSEEvent } from '@/metadata-store/utils/patchMetadataStoreFromSSEEvent';
import { navigationMenuItemsState } from '@/navigation-menu-item/states/navigationMenuItemsState';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { useApolloClient } from '@apollo/client/react';
import {
  AllMetadataName,
  FindManyNavigationMenuItemsDocument,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const NavigationMenuItemSSEEffect = () => {
  const queryId = 'navigation-menu-item-sse-effect';

  const store = useStore();
  const { updateDraft, applyChanges } = useMetadataStore();
  const client = useApolloClient();

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      metadataName: AllMetadataName.navigationMenuItem,
      variables: {},
    },
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.navigationMenuItem,
    onMetadataOperationBrowserEvent: async (eventDetail) => {
      patchMetadataStoreFromSSEEvent(
        store,
        'navigationMenuItems',
        eventDetail.operation,
        eventDetail.updatedCollectionHash,
      );

      const result = await client.query({
        query: FindManyNavigationMenuItemsDocument,
        fetchPolicy: 'network-only',
      });

      if (!isDefined(result.data?.navigationMenuItems)) {
        return;
      }

      const existingNavigationMenuItems = store.get(
        navigationMenuItemsState.atom,
      );

      if (
        !isDeeplyEqual(
          existingNavigationMenuItems,
          result.data.navigationMenuItems,
        )
      ) {
        store.set(
          navigationMenuItemsState.atom,
          result.data.navigationMenuItems,
        );

        updateDraft('navigationMenuItems', result.data.navigationMenuItems);
        applyChanges();
      }
    },
  });

  return null;
};
