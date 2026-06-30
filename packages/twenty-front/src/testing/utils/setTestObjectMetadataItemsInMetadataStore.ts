import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { splitCompositeObjectMetadataItems } from '@/metadata-store/utils/splitCompositeObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type createStore } from 'jotai';

type JotaiStore = ReturnType<typeof createStore>;

export const setTestObjectMetadataItemsInMetadataStore = (
  store: JotaiStore,
  objectMetadataItems: EnrichedObjectMetadataItem[],
) => {
  const { flatObjects, flatFields, flatIndexes } =
    splitCompositeObjectMetadataItems(objectMetadataItems);

  store.set(metadataStoreState.atomFamily('objectMetadataItems'), {
    current: flatObjects,
    draft: [],
    status: 'up-to-date',
  });

  store.set(metadataStoreState.atomFamily('fieldMetadataItems'), {
    current: flatFields,
    draft: [],
    status: 'up-to-date',
  });

  store.set(metadataStoreState.atomFamily('indexMetadataItems'), {
    current: flatIndexes,
    draft: [],
    status: 'up-to-date',
  });
};
