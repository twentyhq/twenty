import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { patchMetadataStoreFromSSEEvent } from '@/metadata-store/utils/patchMetadataStoreFromSSEEvent';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { coreViewsState } from '@/views/states/coreViewState';
import { type CoreViewWithoutRelations } from '@/views/types/CoreViewWithoutRelations';
import { useStore } from 'jotai';
import { AllMetadataName } from '~/generated-metadata/graphql';
import { sleep } from '~/utils/sleep';

export const ViewSSEEffect = () => {
  const queryId = 'views-sse-effect';

  const store = useStore();

  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      metadataName: AllMetadataName.view,
      variables: {},
    },
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.view,
    onMetadataOperationBrowserEvent: async (eventDetail) => {
      patchMetadataStoreFromSSEEvent(
        store,
        'views',
        eventDetail.operation,
        eventDetail.updatedCollectionHash,
      );

      switch (eventDetail.operation.type) {
        case 'create': {
          const createdView = eventDetail.operation
            .createdRecord as unknown as CoreViewWithoutRelations;

          store.set(coreViewsState.atom, (prevCoreViews) => [
            ...prevCoreViews,
            {
              ...createdView,
              viewFields: [],
              viewFieldGroups: [],
              viewFilterGroups: [],
              viewSorts: [],
              viewFilters: [],
              viewGroups: [],
            },
          ]);

          await sleep(50);

          refreshCoreViewsByObjectMetadataId(createdView.objectMetadataId);

          break;
        }
        case 'update': {
          const updatedView = eventDetail.operation
            .updatedRecord as unknown as CoreViewWithoutRelations;

          store.set(coreViewsState.atom, (prevCoreViews) =>
            prevCoreViews.map((coreView) =>
              coreView.id === updatedView.id
                ? {
                    ...coreView,
                    ...updatedView,
                  }
                : coreView,
            ),
          );
          break;
        }
        case 'delete': {
          const deletedViewId = eventDetail.operation.deletedRecordId as string;

          store.set(coreViewsState.atom, (prevCoreViews) =>
            prevCoreViews.filter((coreView) => coreView.id !== deletedViewId),
          );

          break;
        }
        default:
          return;
      }
    },
  });

  return null;
};
