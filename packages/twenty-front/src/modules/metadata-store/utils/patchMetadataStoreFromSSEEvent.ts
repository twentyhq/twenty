import {
  metadataStoreState,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';
import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

type JotaiStore = ReturnType<typeof createStore>;

type SSEEventOperation =
  | {
      type: 'create';
      createdRecord: Record<string, unknown>;
    }
  | {
      type: 'update';
      updatedRecord: Record<string, unknown>;
    }
  | {
      type: 'delete';
      deletedRecordId: string;
    };

export const patchMetadataStoreFromSSEEvent = ({
  store,
  entityKey,
  operation,
  updatedCollectionHash,
}: {
  store: JotaiStore;
  entityKey: MetadataEntityKey;
  operation: SSEEventOperation;
  updatedCollectionHash?: string;
}) => {
  const entry = store.get(metadataStoreState.atomFamily(entityKey));
  const currentItems = entry.current as Array<{ id: string }>;

  const hashUpdate = isDefined(updatedCollectionHash)
    ? { currentCollectionHash: updatedCollectionHash }
    : {};

  switch (operation.type) {
    case 'create': {
      store.set(metadataStoreState.atomFamily(entityKey), {
        ...entry,
        ...hashUpdate,
        current: [...currentItems, operation.createdRecord],
      });
      break;
    }
    case 'update': {
      store.set(metadataStoreState.atomFamily(entityKey), {
        ...entry,
        ...hashUpdate,
        current: currentItems.map((item) =>
          item.id === (operation.updatedRecord as { id: string }).id
            ? { ...item, ...operation.updatedRecord }
            : item,
        ),
      });
      break;
    }
    case 'delete': {
      store.set(metadataStoreState.atomFamily(entityKey), {
        ...entry,
        ...hashUpdate,
        current: currentItems.filter(
          (item) => item.id !== operation.deletedRecordId,
        ),
      });
      break;
    }
  }
};
