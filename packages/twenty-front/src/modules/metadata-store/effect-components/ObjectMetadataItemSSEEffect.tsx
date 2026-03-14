import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
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
      const entry = store.get(
        metadataStoreState.atomFamily('objectMetadataItems'),
      );
      const currentObjects = entry.current as FlatObjectMetadataItem[];

      switch (eventDetail.operation.type) {
        case 'create': {
          const createdObject = eventDetail.operation
            .createdRecord as unknown as FlatObjectMetadataItem;

          store.set(metadataStoreState.atomFamily('objectMetadataItems'), {
            ...entry,
            current: [...currentObjects, createdObject],
          });
          break;
        }
        case 'update': {
          const updatedObject = eventDetail.operation
            .updatedRecord as unknown as FlatObjectMetadataItem;

          store.set(metadataStoreState.atomFamily('objectMetadataItems'), {
            ...entry,
            current: currentObjects.map((object) =>
              object.id === updatedObject.id
                ? { ...object, ...updatedObject }
                : object,
            ),
          });
          break;
        }
        case 'delete': {
          const deletedObjectId = eventDetail.operation
            .deletedRecordId as string;

          store.set(metadataStoreState.atomFamily('objectMetadataItems'), {
            ...entry,
            current: currentObjects.filter(
              (object) => object.id !== deletedObjectId,
            ),
          });
          break;
        }
        default:
          return;
      }

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
