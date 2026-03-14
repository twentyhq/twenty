import {
  metadataStoreState,
  type MetadataEntityKey,
} from '@/metadata-store/states/metadataStoreState';
import { type createStore } from 'jotai';

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

export const patchMetadataStoreFromSSEEvent = (
  store: JotaiStore,
  entityKey: MetadataEntityKey,
  operation: SSEEventOperation,
) => {
  const entry = store.get(metadataStoreState.atomFamily(entityKey));
  const currentItems = entry.current as Array<{ id: string }>;

  switch (operation.type) {
    case 'create': {
      store.set(metadataStoreState.atomFamily(entityKey), {
        ...entry,
        current: [...currentItems, operation.createdRecord],
      });
      break;
    }
    case 'update': {
      store.set(metadataStoreState.atomFamily(entityKey), {
        ...entry,
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
        current: currentItems.filter(
          (item) => item.id !== operation.deletedRecordId,
        ),
      });
      break;
    }
  }
};
