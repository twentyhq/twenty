import { getDraftOrCurrentMetadataItems } from '@/metadata-store/utils/getDraftOrCurrentMetadataItems';
import { isMetadataStoreSnapshotConsistent } from '@/metadata-store/utils/isMetadataStoreSnapshotConsistent';
import { type createStore } from 'jotai';

export const isMetadataStoreDraftConsistent = (
  store: ReturnType<typeof createStore>,
) =>
  isMetadataStoreSnapshotConsistent({
    objectMetadataItems: getDraftOrCurrentMetadataItems({
      store,
      metadataEntityKey: 'objectMetadataItems',
    }),
    fieldMetadataItems: getDraftOrCurrentMetadataItems({
      store,
      metadataEntityKey: 'fieldMetadataItems',
    }),
    indexMetadataItems: getDraftOrCurrentMetadataItems({
      store,
      metadataEntityKey: 'indexMetadataItems',
    }),
    views: getDraftOrCurrentMetadataItems({
      store,
      metadataEntityKey: 'views',
    }),
  });
