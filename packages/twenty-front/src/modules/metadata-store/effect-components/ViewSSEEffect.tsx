import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { patchMetadataStoreFromSSEEvent } from '@/metadata-store/utils/patchMetadataStoreFromSSEEvent';
import { useStore } from 'jotai';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const ViewSSEEffect = () => {
  const store = useStore();

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.view,
    onMetadataOperationBrowserEvent: (eventDetail) => {
      patchMetadataStoreFromSSEEvent(
        store,
        'views',
        eventDetail.operation,
        eventDetail.updatedCollectionHash,
      );
    },
  });

  return null;
};
