import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { patchMetadataStoreFromSSEEvent } from '@/metadata-store/utils/patchMetadataStoreFromSSEEvent';
import { useStore } from 'jotai';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const ViewFilterSSEEffect = () => {
  const store = useStore();

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.viewFilter,
    onMetadataOperationBrowserEvent: (eventDetail) => {
      patchMetadataStoreFromSSEEvent(
        store,
        'viewFilters',
        eventDetail.operation,
        eventDetail.updatedCollectionHash,
      );
    },
  });

  return null;
};
