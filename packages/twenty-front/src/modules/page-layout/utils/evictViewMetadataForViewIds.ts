import type { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import {
  type MetadataEntityKey,
  metadataStoreState,
} from '@/metadata-store/states/metadataStoreState';

const VIEW_RELATED_METADATA_KEYS: MetadataEntityKey[] = [
  'viewFields',
  'viewFieldGroups',
];

export const evictViewMetadataForViewIds = (
  store: ReturnType<typeof useStore>,
  viewIds: Set<string>,
) => {
  if (viewIds.size === 0) {
    return;
  }

  for (const key of VIEW_RELATED_METADATA_KEYS) {
    store.set(metadataStoreState.atomFamily(key), (prev) => ({
      ...prev,
      current: (prev.current as { viewId?: string }[]).filter(
        (item) => !isDefined(item.viewId) || !viewIds.has(item.viewId),
      ),
      currentCollectionHash: undefined,
    }));
  }
};
