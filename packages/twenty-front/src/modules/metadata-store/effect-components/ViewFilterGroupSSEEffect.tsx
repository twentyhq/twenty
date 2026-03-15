import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { patchMetadataStoreFromSSEEvent } from '@/metadata-store/utils/patchMetadataStoreFromSSEEvent';
import { useStore } from 'jotai';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const ViewFilterGroupSSEEffect = () => {
  const store = useStore();

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.viewFilterGroup,
    onMetadataOperationBrowserEvent: (eventDetail) => {
      patchMetadataStoreFromSSEEvent(
        store,
        'viewFilterGroups',
        eventDetail.operation,
        eventDetail.updatedCollectionHash,
      );
    },
  });

  return null;
};
