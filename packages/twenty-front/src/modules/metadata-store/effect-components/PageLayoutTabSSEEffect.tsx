import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { patchMetadataStoreFromSSEEvent } from '@/metadata-store/utils/patchMetadataStoreFromSSEEvent';
import { useRefreshPageLayouts } from '@/page-layout/hooks/useRefreshPageLayouts';
import { useStore } from 'jotai';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const PageLayoutTabSSEEffect = () => {
  const store = useStore();
  const { refreshPageLayouts } = useRefreshPageLayouts();

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.pageLayoutTab,
    onMetadataOperationBrowserEvent: (eventDetail) => {
      patchMetadataStoreFromSSEEvent(
        store,
        'pageLayoutTabs',
        eventDetail.operation,
        eventDetail.updatedCollectionHash,
      );

      refreshPageLayouts();
    },
  });

  return null;
};
