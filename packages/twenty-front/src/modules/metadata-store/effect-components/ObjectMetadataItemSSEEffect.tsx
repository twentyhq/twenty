import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useStore } from 'jotai';
import {
  AllMetadataName,
  useFindManyNavigationMenuItemsLazyQuery,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const ObjectMetadataItemSSEEffect = () => {
  const queryId = 'object-metadata-sse-effect';

  const store = useStore();

  const { refreshObjectMetadataItems } = useRefreshObjectMetadataItems();
  const { updateDraft, applyChanges } = useMetadataStore();

  const [findManyNavigationMenuItemsLazy] =
    useFindManyNavigationMenuItemsLazyQuery();

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      metadataName: AllMetadataName.objectMetadata,
      variables: {},
    },
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.objectMetadata,
    onMetadataOperationBrowserEvent: async () => {
      await refreshObjectMetadataItems();

      const loadedObjects = store.get(objectMetadataItemsState.atom);
      updateDraft('objectMetadataItems', loadedObjects);
      applyChanges();

      const navigationMenuItemsResult = await findManyNavigationMenuItemsLazy({
        fetchPolicy: 'network-only',
      });

      const existingNavigationMenuItems = store.get(
        prefetchNavigationMenuItemsState.atom,
      );

      if (
        !isDeeplyEqual(
          existingNavigationMenuItems,
          navigationMenuItemsResult.data?.navigationMenuItems,
        )
      ) {
        store.set(
          prefetchNavigationMenuItemsState.atom,
          navigationMenuItemsResult.data?.navigationMenuItems ?? [],
        );
      }
    },
  });

  return null;
};
