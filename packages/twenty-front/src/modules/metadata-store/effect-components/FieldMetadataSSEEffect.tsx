import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { patchMetadataStoreFromSSEEvent } from '@/metadata-store/utils/patchMetadataStoreFromSSEEvent';
import { useStore } from 'jotai';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const FieldMetadataSSEEffect = () => {
  const store = useStore();

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.fieldMetadata,
    onMetadataOperationBrowserEvent: (eventDetail) => {
      patchMetadataStoreFromSSEEvent(
        store,
        'fieldMetadataItems',
        eventDetail.operation,
        eventDetail.updatedCollectionHash,
      );
    },
  });

  return null;
};
