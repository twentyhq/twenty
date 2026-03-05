import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useRefreshPageLayouts } from '@/page-layout/hooks/useRefreshPageLayouts';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const PageLayoutSSEEffect = () => {
  const queryId = 'page-layout-metadata-sse-effect';

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
    onMetadataOperationBrowserEvent: () => {
      refreshPageLayouts();
    },
  });

  return null;
};
