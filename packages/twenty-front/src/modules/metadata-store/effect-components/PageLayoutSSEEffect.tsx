import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { patchMetadataStoreFromSSEEvent } from '@/metadata-store/utils/patchMetadataStoreFromSSEEvent';
import { useRefreshPageLayouts } from '@/page-layout/hooks/useRefreshPageLayouts';
import { useStore } from 'jotai';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const PageLayoutSSEEffect = () => {
  const store = useStore();
  const { refreshPageLayouts } = useRefreshPageLayouts();

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.pageLayout,
    onMetadataOperationBrowserEvent: (eventDetail) => {
      patchMetadataStoreFromSSEEvent(
        store,
        'pageLayouts',
        eventDetail.operation,
        eventDetail.updatedCollectionHash,
      );

      refreshPageLayouts();
    },
  });

  return null;
};
