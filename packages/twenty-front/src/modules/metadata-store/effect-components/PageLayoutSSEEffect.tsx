import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { patchMetadataStoreFromSSEEvent } from '@/metadata-store/utils/patchMetadataStoreFromSSEEvent';
import { useRefreshPageLayouts } from '@/page-layout/hooks/useRefreshPageLayouts';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useStore } from 'jotai';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const PageLayoutSSEEffect = () => {
  const queryId = 'page-layout-metadata-sse-effect';

  const store = useStore();
  const { refreshPageLayouts } = useRefreshPageLayouts();

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      metadataName: AllMetadataName.pageLayout,
      variables: {},
    },
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.pageLayout,
    onMetadataOperationBrowserEvent: (eventDetail) => {
      patchMetadataStoreFromSSEEvent(
        store,
        'pageLayouts',
        eventDetail.operation,
      );

      refreshPageLayouts();
    },
  });

  return null;
};
