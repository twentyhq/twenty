import { getPendingOrCurrentMetadataItems } from '@/metadata-store/utils/getPendingOrCurrentMetadataItems';
import { isMetadataStoreSnapshotConsistent } from '@/metadata-store/utils/isMetadataStoreSnapshotConsistent';
import { type createStore } from 'jotai';

export const isPendingMetadataStoreStateConsistent = (
  store: ReturnType<typeof createStore>,
) =>
  isMetadataStoreSnapshotConsistent({
    objectMetadataItems: getPendingOrCurrentMetadataItems({
      store,
      metadataEntityKey: 'objectMetadataItems',
    }),
    fieldMetadataItems: getPendingOrCurrentMetadataItems({
      store,
      metadataEntityKey: 'fieldMetadataItems',
    }),
    indexMetadataItems: getPendingOrCurrentMetadataItems({
      store,
      metadataEntityKey: 'indexMetadataItems',
    }),
    views: getPendingOrCurrentMetadataItems({
      store,
      metadataEntityKey: 'views',
    }),
  });
