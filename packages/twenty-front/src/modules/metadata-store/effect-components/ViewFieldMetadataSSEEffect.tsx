import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { coreViewsState } from '@/views/states/coreViewState';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import {
  AllMetadataName,
  type CoreViewField,
} from '~/generated-metadata/graphql';

export const ViewFieldMetadataSSEEffect = () => {
  const store = useStore();

  const queryId = 'view-field-metadata-sse-effect';

  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      metadataName: AllMetadataName.viewField,
      variables: {},
    },
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.viewField,
    onMetadataOperationBrowserEvent: (eventDetail) => {
      const coreViews = store.get(coreViewsState.atom);

      let viewId: string | undefined;

      switch (eventDetail.operation.type) {
        case 'create': {
          const createdViewField = eventDetail.operation
            .createdRecord as unknown as CoreViewField;
          viewId = createdViewField.viewId;
          break;
        }
        case 'update': {
          const updatedViewField = eventDetail.operation
            .updatedRecord as unknown as CoreViewField;
          viewId = updatedViewField.viewId;
          break;
        }
        case 'delete': {
          const deletedViewFieldId = eventDetail.operation
            .deletedRecordId as string;

          const view = coreViews.find((coreView) =>
            coreView.viewFields.some(
              (viewField) => viewField.id === deletedViewFieldId,
            ),
          );

          viewId = view?.id;
          break;
        }
      }

      if (!isDefined(viewId)) {
        return;
      }

      const view = coreViews.find((coreView) => coreView.id === viewId);

      if (!isDefined(view)) {
        return;
      }

      refreshCoreViewsByObjectMetadataId(view.objectMetadataId);
    },
  });

  return null;
};
