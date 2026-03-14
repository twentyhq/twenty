import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { patchMetadataStoreFromSSEEvent } from '@/metadata-store/utils/patchMetadataStoreFromSSEEvent';
import { useRefreshPageLayouts } from '@/page-layout/hooks/useRefreshPageLayouts';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useStore } from 'jotai';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const PageLayoutTabSSEEffect = () => {
  const queryId = 'page-layout-tab-sse-effect';

  const store = useStore();
  const { refreshPageLayouts } = useRefreshPageLayouts();

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      metadataName: AllMetadataName.pageLayoutTab,
      variables: {},
    },
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.pageLayoutTab,
    onMetadataOperationBrowserEvent: (eventDetail) => {
      patchMetadataStoreFromSSEEvent(
        store,
        'pageLayoutTabs',
        eventDetail.operation,
      );

      refreshPageLayouts();
    },
  });

  return null;
};
