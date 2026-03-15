import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { patchMetadataStoreFromSSEEvent } from '@/metadata-store/utils/patchMetadataStoreFromSSEEvent';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { coreViewsState } from '@/views/states/coreViewState';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { AllMetadataName } from '~/generated-metadata/graphql';

export const ViewFilterSSEEffect = () => {
  const store = useStore();

  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  useListenToEventsForQuery({
    queryId: 'view-filters-sse-effect',
    operationSignature: {
      metadataName: AllMetadataName.viewFilter,
      variables: {},
    },
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.viewFilter,
    onMetadataOperationBrowserEvent: (eventDetail) => {
      patchMetadataStoreFromSSEEvent(
        store,
        'viewFilters',
        eventDetail.operation,
        eventDetail.updatedCollectionHash,
      );

      const coreViews = store.get(coreViewsState.atom);

      let viewId: string | undefined;

      switch (eventDetail.operation.type) {
        case 'create': {
          viewId = (eventDetail.operation.createdRecord as { viewId?: string })
            .viewId;
          break;
        }
        case 'update': {
          viewId = (eventDetail.operation.updatedRecord as { viewId?: string })
            .viewId;
          break;
        }
        case 'delete': {
          const deletedId = eventDetail.operation.deletedRecordId as string;
          viewId = coreViews.find((view) =>
            view.viewFilters.some((viewFilter) => viewFilter.id === deletedId),
          )?.id;
          break;
        }
      }

      if (!isDefined(viewId)) {
        return;
      }

      const view = coreViews.find((coreView) => coreView.id === viewId);

      if (isDefined(view)) {
        refreshCoreViewsByObjectMetadataId(view.objectMetadataId);
      }
    },
  });

  return null;
};
