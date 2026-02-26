import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useRefreshPageLayouts } from '@/page-layout/hooks/useRefreshRecordPageLayouts';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const PageLayoutTabSSEEffect = () => {
  const queryId = 'page-layout-tab-metadata-sse-effect';

  const { refreshRecordPageLayouts } = useRefreshPageLayouts();

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      metadataName: AllMetadataName.pageLayoutTab,
      variables: {},
    },
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.pageLayoutTab,
    onMetadataOperationBrowserEvent: () => {
      refreshRecordPageLayouts();
    },
  });

  return null;
};
