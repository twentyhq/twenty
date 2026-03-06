import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useRefreshPageLayouts } from '@/page-layout/hooks/useRefreshPageLayouts';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const PageLayoutWidgetSSEEffect = () => {
  const queryId = 'page-layout-widget-sse-effect';

  const { refreshPageLayouts } = useRefreshPageLayouts();

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      metadataName: AllMetadataName.pageLayoutWidget,
      variables: {},
    },
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.pageLayoutWidget,
    onMetadataOperationBrowserEvent: () => {
      refreshPageLayouts();
    },
  });

  return null;
};
