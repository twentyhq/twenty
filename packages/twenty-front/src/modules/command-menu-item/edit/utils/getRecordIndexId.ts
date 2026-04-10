import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import type { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const getRecordIndexId = (
  store: ReturnType<typeof useStore>,
): string | null => {
  const objectMetadataItemId = store.get(
    contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
      instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
  );

  const viewId = store.get(
    contextStoreCurrentViewIdComponentState.atomFamily({
      instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
  );

  if (!isDefined(objectMetadataItemId) || !isDefined(viewId)) {
    return null;
  }

  const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === objectMetadataItemId,
  );

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  return getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem.namePlural,
    viewId,
  );
};
