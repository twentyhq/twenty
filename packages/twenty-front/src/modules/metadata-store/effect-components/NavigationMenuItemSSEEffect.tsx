import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import {
  AllMetadataName,
  useFindManyNavigationMenuItemsLazyQuery,
} from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const NavigationMenuItemSSEEffect = () => {
  const queryId = 'navigation-menu-item-sse-effect';

  const store = useStore();
  const { updateDraft, applyChanges } = useMetadataStore();

  const [findManyNavigationMenuItemsLazy] =
    useFindManyNavigationMenuItemsLazyQuery();

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      metadataName: AllMetadataName.navigationMenuItem,
      variables: {},
    },
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.navigationMenuItem,
    onMetadataOperationBrowserEvent: async () => {
      const result = await findManyNavigationMenuItemsLazy({
        fetchPolicy: 'network-only',
      });

      if (!isDefined(result.data?.navigationMenuItems)) {
        return;
      }

      const existingNavigationMenuItems = store.get(
        prefetchNavigationMenuItemsState.atom,
      );

      if (
        !isDeeplyEqual(
          existingNavigationMenuItems,
          result.data.navigationMenuItems,
        )
      ) {
        store.set(
          prefetchNavigationMenuItemsState.atom,
          result.data.navigationMenuItems,
        );

        updateDraft('navigationMenuItems', result.data.navigationMenuItems);
        applyChanges();
      }
    },
  });

  return null;
};
