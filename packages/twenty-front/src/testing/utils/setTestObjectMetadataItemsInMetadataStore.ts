import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { splitObjectMetadataItemWithRelated } from '@/metadata-store/utils/splitObjectMetadataItemWithRelated';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type createStore } from 'jotai';

type JotaiStore = ReturnType<typeof createStore>;

export const setTestObjectMetadataItemsInMetadataStore = (
  store: JotaiStore,
  objectMetadataItems: ObjectMetadataItem[],
) => {
  const { flatObjects, flatFields, flatIndexes } =
    splitObjectMetadataItemWithRelated(objectMetadataItems);

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
