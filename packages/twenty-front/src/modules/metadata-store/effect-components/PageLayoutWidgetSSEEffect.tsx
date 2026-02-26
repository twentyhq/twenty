import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useRefreshPageLayouts } from '@/page-layout/hooks/useRefreshRecordPageLayouts';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const PageLayoutWidgetSSEEffect = () => {
  const queryId = 'page-layout-widget-metadata-sse-effect';

  const { refreshRecordPageLayouts } = useRefreshPageLayouts();

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
      console.log('page layout widget sse event');
      refreshRecordPageLayouts();
    },
  });

  return null;
};
