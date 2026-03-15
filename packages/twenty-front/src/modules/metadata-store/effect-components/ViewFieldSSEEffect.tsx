import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { patchMetadataStoreFromSSEEvent } from '@/metadata-store/utils/patchMetadataStoreFromSSEEvent';
import { useStore } from 'jotai';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const ViewFieldSSEEffect = () => {
  const store = useStore();

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.viewField,
    onMetadataOperationBrowserEvent: (eventDetail) => {
      patchMetadataStoreFromSSEEvent(
        store,
        'viewFields',
        eventDetail.operation,
        eventDetail.updatedCollectionHash,
      );
    },
  });

  return null;
};
